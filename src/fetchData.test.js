import {
  calculateGoalDifference,
  calculatePoints,
  calculateWin,
  calculateLoss,
  calculateDraw,
  calculateGamesPlayed,
  sortLeagueTableOnAscendingData,
  sortLeagueTableOnDescendingData,
  transformAllFixturesIntoOneStructure,
  createTableFromFixtureData,
  getUpdatedTeamData,
  getPremierLeagueTable
} from "./fetchData";

describe("Test calculations", () => {
  it("calculateGoalDifference returns as expected", () => {
    const testValue1 = { GF: 10, GA: 2 };
    expect(calculateGoalDifference(testValue1)).not.toEqual(10);
    expect(calculateGoalDifference(testValue1)).toEqual(8);
  });

  it("calculatePoints returns as expected", () => {
    const testValue1 = { wins: 1, draws: 2 };
    expect(calculatePoints(testValue1)).not.toEqual(8);
    expect(calculatePoints(testValue1)).toEqual(5);
  });

  it("calculateWin returns as expected", () => {
    expect(calculateWin(10, 2)).toEqual(1);
    expect(calculateWin(2, 10)).toEqual(0);
  });

  it("calculateLoss returns as expected", () => {
    expect(calculateLoss(10, 2)).toEqual(0);
    expect(calculateLoss(2, 10)).toEqual(1);
  });

  it("calculateDraw returns as expected", () => {
    expect(calculateDraw(10, 2)).toEqual(0);
    expect(calculateDraw(2, 2)).toEqual(1);
  });

  it("calculateGamesPlayed returns as expected", () => {
    expect(calculateGamesPlayed(10, 2, 0)).not.toEqual(0);
    expect(calculateGamesPlayed(10, 2, 0)).toEqual(12);
  });
});

describe("Test sorting", () => {
  it("sortLeagueTableOnAscendingData returns as expected", () => {
    const leagueTable = new Map();
    leagueTable.set("team2", { wins: 8, losses: 2, draws: 2 });
    leagueTable.set("team1", { wins: 9, losses: 2, draws: 1 });
    leagueTable.set("team3", { wins: 10, losses: 1, draws: 1 });

    const sortedMap = new Map();
    sortedMap.set("team3", { wins: 10, losses: 1, draws: 1 });
    sortedMap.set("team1", { wins: 9, losses: 2, draws: 1 });
    sortedMap.set("team2", { wins: 8, losses: 2, draws: 2 });

    const sortVar = "wins";
    expect(sortLeagueTableOnAscendingData(leagueTable, sortVar)).toEqual(
      sortedMap
    );
  });

  it("sortLeagueTableOnDescendingData returns as expected", () => {
    const leagueTable = new Map();
    leagueTable.set("team1", { GF: 10, GA: 9, GD: 1 });
    leagueTable.set("team2", { GF: 10, GA: 5, GD: 5 });
    leagueTable.set("team3", { GF: 10, GA: 3, GD: 7 });

    const sortedMap = new Map();
    sortedMap.set("team3", { GF: 10, GA: 3, GD: 7 });
    sortedMap.set("team2", { GF: 10, GA: 5, GD: 5 });
    sortedMap.set("team1", { GF: 10, GA: 9, GD: 1 });

    const sortVar = "GA";
    expect(sortLeagueTableOnDescendingData(leagueTable, sortVar)).toEqual(
      sortedMap
    );
  });
});

describe("Test transformation", () => {
  it("transformAllFixturesIntoOneStructure returns as expected", () => {
    const unformatted = {
      rounds: [
        {
          matches: [{ team: "footballTeam1" }, { team: "footballTeam1" }]
        }
      ]
    };
    const formatted = [{ team: "footballTeam1" }, { team: "footballTeam1" }];

    expect(transformAllFixturesIntoOneStructure(unformatted)).not.toEqual(
      unformatted
    );
    expect(transformAllFixturesIntoOneStructure(unformatted)).toEqual(
      formatted
    );
  });
});

describe("Core behaviour", () => {
  it("Test createTableFromFixtureData creates new entries as expected", () => {
    const leagueFixtures = [
      {
        score1: 1,
        score2: 0,
        team1: { code: "team1" },
        team2: { code: "team2" }
      },
      {
        score1: 1,
        score2: 0,
        team1: { code: "team2" },
        team2: { code: "team3" }
      }
    ];

    const finalLeagueTable = new Map();
    finalLeagueTable.set("team1", {
      draws: 0,
      losses: 0,
      played: 1,
      wins: 1,
      GF: 1,
      GA: 0,
      GD: 1,
      points: 3
    });
    finalLeagueTable.set("team2", {
      draws: 0,
      losses: 1,
      played: 2,
      wins: 1,
      GF: 1,
      GA: 1,
      GD: 0,
      points: 3
    });
    finalLeagueTable.set("team3", {
      draws: 0,
      losses: 1,
      played: 1,
      wins: 0,
      GF: 0,
      GA: 1,
      GD: -1,
      points: 0
    });

    expect(createTableFromFixtureData(leagueFixtures)).toEqual(
      finalLeagueTable
    );
  });

  it("Test getUpdatedTeamData returns as expected ", () => {
    const teamStats = {
      GF: 1,
      GA: 0,
      wins: 1,
      losses: 0,
      draws: 0
    };
    const teamCode = "team4";

    const result = {
      GF: 1,
      GA: 0,
      wins: 1,
      losses: 0,
      draws: 0,
      GD: 1,
      points: 3,
      played: 1
    };

    expect(getUpdatedTeamData(teamStats, teamCode)).toEqual(result);
  });

  it("Test getPremierLeagueTable returns as expected ", async () => {
    const mockSuccessResponse = {
      rounds: [
        {
          matches: [
            {
              score1: 1,
              score2: 0,
              team1: { key: "team4", code: "team4" },
              team2: { key: "team5", code: "team5" }
            }
          ]
        }
      ]
    };
    const mockJsonPromise = Promise.resolve(mockSuccessResponse);
    const mockFetchPromise = Promise.resolve({
      json: () => mockJsonPromise
    });
    jest.spyOn(global, "fetch").mockImplementation(() => mockFetchPromise);

    const finalLeagueTable = new Map();
    finalLeagueTable.set("team4", {
      draws: 0,
      losses: 0,
      played: 1,
      wins: 1,
      GF: 1,
      GA: 0,
      GD: 1,
      points: 3
    });
    finalLeagueTable.set("team1", {
      draws: 0,
      losses: 0,
      played: 1,
      wins: 1,
      GF: 1,
      GA: 0,
      GD: 1,
      points: 3
    });
    finalLeagueTable.set("team2", {
      draws: 0,
      losses: 1,
      played: 2,
      wins: 1,
      GF: 1,
      GA: 1,
      GD: 0,
      points: 3
    });
    finalLeagueTable.set("team3", {
      draws: 0,
      losses: 1,
      played: 1,
      wins: 0,
      GF: 0,
      GA: 1,
      GD: -1,
      points: 0
    });
    finalLeagueTable.set("team5", {
      draws: 0,
      losses: 1,
      played: 1,
      wins: 0,
      GF: 0,
      GA: 1,
      GD: -1,
      points: 0
    });

    expect(await getPremierLeagueTable()).toEqual(finalLeagueTable);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://raw.githubusercontent.com/openfootball/football.json/master/2016-17/en.1.json"
    );
  });
});
