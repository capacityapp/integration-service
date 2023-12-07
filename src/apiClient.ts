import got from 'got'
import queryString from 'query-string'

export const post = ({ endpoint, body, query }) =>
  got.post(`${process.env.BASE_URL}/${endpoint}`, {
    json: body,
    headers: { Authorization: `Api-Key ${process.env.API_KEY}` },
    search: queryString.stringify(query),
  })
