// @flow

import axios from 'axios'
import { match, slice } from 'ramda'

type Bio = string
type Username = string

const USERNAME_REGEX =
  /@[a-z][_a-z0-9]{3,30}[a-z0-9]/ig

const getBioFromPage = (html: string): Bio =>
  // ZA̡͊͠͝LGΌ ISͮ̂҉̯͈͕̹̘̱ TO͇̹̺ͅƝ̴ȳ̳ TH̘Ë͖́̉ ͠P̯͍̭O̚​N̐Y̡
  match(/<div class="tgme_page_description">(.*?)<\/div>/, html)[1] || ''

const getUsernamesFromBio = (bio: Bio): Username[] =>
  match(USERNAME_REGEX, bio)
    .filter(Boolean)
    .map(slice(1, Infinity))

export const getUsernames = (username: Username): Promise<Username[]> =>
  axios.get(`https://t.me/${username}`)
    .then(({ data }) => getBioFromPage(data))
    .then(bio => getUsernamesFromBio(bio))
