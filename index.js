require('dotenv').config()

const Twit = require('twit')
const createCsvWriter = require('csv-writer').createObjectCsvWriter

const T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

const fetchFollowers = (user, cursor) => (
  new Promise((resolve, reject) => {
    T.get('followers/list', {
      screen_name: user,
      count: 200,
      include_user_entities: false,
      skip_status: true,
      cursor: cursor
    }, (err, data, response) => {
      if (err) {
        if (err.code === 88) { // Rate limit reached
          err.msLeft = // ms left until limit is lifted
            parseInt(response.headers['x-rate-limit-reset']) * // unix seconds
            1000 + // JS works with milliseconds
            2000 - // Add 2 seconds for good measure
            Date.now()
        }

        reject(err)
      } else {
        resolve(data)
      }
    })
  })
)

const fetchAndRetryIfRateLimited = async (user, cursor) => {
  let data

  try {
    data = await fetchFollowers(user, cursor)
  } catch (e) {
    if (e.code === 88) {
      console.log(`API rate limit reached, trying again in ${(e.msLeft / 60000).toFixed(2)} minutes.`)
      await new Promise(resolve => setTimeout(resolve, e.msLeft))

      console.log('Trying again...')
      data = await fetchAndRetryIfRateLimited(user, cursor)
    } else {
      throw e
    }
  }

  return data
}

const getRecords = async (user) => {
  let records = []

  let cursor = '-1'
  do {
    const data = await fetchAndRetryIfRateLimited(user, cursor)

    console.log(`Fetched ${data.users.length} followers for cursor ${cursor}...`)

    data.users.forEach((u) => {
      records.push({
        id: u.id_str,
        name: u.name,
        user: u.screen_name,
        followed: u.following,
        followers: u.followers_count,
        following: u.friends_count,
        listed: u.listed_count,
        favourites: u.favourites_count,
        statuses: u.statuses_count,
        created_at: new Date(Date.parse(u.created_at)).toISOString(),
        profile_image: u.profile_image_url_https
      })
    })

    cursor = data.next_cursor_str
  } while (cursor !== '0')

  console.log('Finished fetching followers.')

  return records
}

const run = async () => {
  const csvWriter = createCsvWriter({
    path: process.env.OUTPUT_PATH,
    header: [
      { id: 'id', title: 'ID' },
      { id: 'name', title: 'NAME' },
      { id: 'user', title: 'USER' },
      { id: 'followed', title: 'FOLLOWED' },
      { id: 'followers', title: 'FOLLOWERS' },
      { id: 'following', title: 'FOLLOWING' },
      { id: 'listed', title: 'LISTED' },
      { id: 'favourites', title: 'FAVOURITES' },
      { id: 'statuses', title: 'STATUSES' },
      { id: 'created_at', title: 'CREATED_AT' },
      { id: 'profile_image', title: 'PROFILE_IMAGE' }
    ]
  })

  console.log(`Fetching ${process.env.SCREEN_NAME} followers...`)

  const records = await getRecords(process.env.SCREEN_NAME)

  console.log(`Writing to CSV file ${process.env.OUTPUT_PATH}`)

  csvWriter.writeRecords(records).then(() => { console.log('Done!') })
}

run()
