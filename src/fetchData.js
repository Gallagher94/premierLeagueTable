const DATAURL =
  "https://raw.githubusercontent.com/openfootball/football.json/master/2016-17/en.1.json";
let leagueTable = new Map();

/*
 * Get data
 */
const getPremierLeagueTable = async () => {
  // leagueTable = new Map();
  try {
    const response = await fetch(DATAURL);
    const json = await response.json();
    const leagueFixtures = transformAllFixturesIntoOneStructure(json);
    return createTableFromFixtureData(leagueFixtures);
  } catch (error) {
    console.log("Data was not pulled from remote correctly");
    return leagueTable;
  }
};

/*
 * Transformation
 */
const transformAllFixturesIntoOneStructure = unformatted => {
  let leagueFixtures = [];
  unformatted.rounds.forEach(fixtureSet => {
    fixtureSet.matches.forEach(fixture => {
      leagueFixtures.push(fixture);
    });
  });
  return leagueFixtures;
};

/*
 * Core Functionality
 */
const createTableFromFixtureData = leagueFixtures => {
  leagueFixtures.forEach(({ team1, team2, score1, score2 }) => {
    const teamOne = {
      teamCode: team1.code,
      goalsFor: score1,
      goalsAgainst: score2
    };
    const teamTwo = {
      teamCode: team2.code,
      goalsFor: score2,
      goalsAgainst: score1
    };
    updateTable(teamOne);
    updateTable(teamTwo);
  });

  const sortedByGA = sortLeagueTableOnDescendingData(leagueTable, ["GA"]);
  const sortedByGF = sortLeagueTableOnAscendingData(sortedByGA, ["GF"]);
  const sortedByGD = sortLeagueTableOnAscendingData(sortedByGF, ["GD"]);
  const sortedByPoints = sortLeagueTableOnAscendingData(sortedByGD, ["points"]);
  return sortedByPoints;
};

const updateTable = ({ teamCode, goalsFor, goalsAgainst }) => {
  const teamStats = {
    GF: goalsFor,
    GA: goalsAgainst,
    wins: calculateWin(goalsFor, goalsAgainst),
    losses: calculateLoss(goalsFor, goalsAgainst),
    draws: calculateDraw(goalsFor, goalsAgainst)
  };
  const newTeamState = getUpdatedTeamData(teamStats, teamCode);
  leagueTable.set(teamCode, newTeamState);
};

const getUpdatedTeamData = (newStats, teamCode) => {
  const currentStats = leagueTable.has(teamCode)
    ? leagueTable.get(teamCode)
    : getDefaultTeamValues();

  const teamStats = {
    wins: currentStats.wins + newStats.wins,
    losses: currentStats.losses + newStats.losses,
    draws: currentStats.draws + newStats.draws,
    GF: currentStats.GF + newStats.GF,
    GA: currentStats.GA + newStats.GA
  };

  const points = calculatePoints(teamStats);
  const GD = calculateGoalDifference(teamStats);
  const played = calculateGamesPlayed(
    teamStats.wins,
    teamStats.losses,
    teamStats.draws
  );
  return { ...teamStats, GD, points, played };
};

/*
 * Helper providing base values for new teams being added into table
 */
const getDefaultTeamValues = () => {
  return {
    wins: 0,
    losses: 0,
    draws: 0,
    GF: 0,
    GA: 0
  };
};

/*
 * Calculations
 */
const calculateGoalDifference = ({ GF, GA }) => {
  return GF - GA;
};

const calculatePoints = ({ wins, draws }) => {
  return wins * 3 + draws * 1;
};

const calculateWin = (goalsScored, goalsAgainst) => {
  return goalsScored > goalsAgainst ? 1 : 0;
};

const calculateLoss = (goalsScored, goalsAgainst) => {
  return goalsScored < goalsAgainst ? 1 : 0;
};

const calculateDraw = (goalsScored, goalsAgainst) => {
  return goalsScored === goalsAgainst ? 1 : 0;
};

const calculateGamesPlayed = (wins, losses, draws) => {
  return wins + losses + draws;
};

/*
 * Sort Table
 */
const sortLeagueTableOnAscendingData = (leagueTable, sortVar) => {
  return new Map(
    [...leagueTable].sort((a, b) =>
      a[1][sortVar] === b[1][sortVar]
        ? 0
        : b[1][sortVar] > a[1][sortVar]
        ? 1
        : -1
    )
  );
};

const sortLeagueTableOnDescendingData = (leagueTable, sortVar) => {
  return new Map(
    [...leagueTable].sort((a, b) =>
      a[1][sortVar] === b[1][sortVar]
        ? 0
        : a[1][sortVar] > b[1][sortVar]
        ? 1
        : -1
    )
  );
};

export default getPremierLeagueTable;

if (process.env.NODE_ENV === "test") {
  module.exports = {
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
  };
}
