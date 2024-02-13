
const { unifyGenre } = require('./index.js')

describe("Unify the genre string of all radio stations, also if they do mistakes and write too many strings.", () => {
  test("remove comma, hyphen and limit output to 3 strings", () => {
    expect(unifyGenre("dance, hiphop, thrash-metal, bingo, bongo, classic")).toBe("dance hiphop thrash")
  })
  const genreStrings = [
    ["dance, hiphop, thrash-metal, bingo, bongo, classic", "dance hiphop thrash"],
    ["classic, dance, dance, dance, hiphop, hiphop, thrash-metal, bingo, bongo, classic", "classic dance hiphop"],
    [null, "---"],
    [undefined, "---"],
    ["", ""],
    [" ", ""],
  ];

  test.each(genreStrings)(
      "genreStrings passes for string value %j with result %j",
      (fixture, result) => expect(unifyGenre(fixture)).toBe(result)
  );
});
