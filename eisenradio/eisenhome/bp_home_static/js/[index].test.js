
const { unifyGenre } = require('./index.js')

describe("Unify the genre string of all radio stations, also if they do mistakes and write too many strings.", () => {
  test("format the genre string correctly", () => {
    expect(unifyGenre("dance, hiphop, thrash-metal, bingo, bongo, classic")).toBe("dance hiphop thrash metal")
  })
})
