const DATAURL =
  "https://raw.githubusercontent.com/openfootball/football.json/master/2016-17/en.1.json";
/*
 * Helper providing base values for new teams being added into table
 */
const getDefaultTeamValues = Object.freeze({
  wins: 0,
  losses: 0,
  draws: 0,
  GF: 0,
  GA: 0
});

let leagueTable;
/*
 * Get data
 */
const getPremierLeagueTable = async () => {
  leagueTable = new Map();
  try {
    const response = await fetch(DATAURL);
    const json = await response.json();
    const leagueFixtures = transformAllFixturesIntoOneStructure(json);
    return createTableFromFixtureData(leagueFixtures, leagueTable);
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
const createTableFromFixtureData = (leagueFixtures, leagueTable) => {
  leagueFixtures.forEach(({ team1, team2, score1, score2 }) => {
    const teamOne = {
      teamCode: team1.code,
      GF: score1,
      GA: score2
    };
    const teamTwo = {
      teamCode: team2.code,
      GF: score2,
      GA: score1
    };
    updateTable([teamOne, teamTwo], leagueTable);
  });

  const sortedByGA = sortLeagueTableOnDescendingData(leagueTable, "GA");
  const sortedByGF = sortLeagueTableOnAscendingData(sortedByGA, "GF");
  const sortedByGD = sortLeagueTableOnAscendingData(sortedByGF, "GD");
  const sortedByPoints = sortLeagueTableOnAscendingData(sortedByGD, "points");
  return sortedByPoints;
};

const updateTable = (teamsToUpdate, leagueTable) => {
  teamsToUpdate.forEach(({ teamCode, GF, GA }) => {
    const teamStats = {
      GF,
      GA,
      wins: calculateWin(GF, GA),
      losses: calculateLoss(GF, GA),
      draws: calculateDraw(GF, GA)
    };
    const currentStats = leagueTable.get(teamCode);
    const newTeamStats = getUpdatedTeamData(teamStats, currentStats);
    leagueTable.set(teamCode, newTeamStats);
  });
};

const getUpdatedTeamData = (newStats, currentStats = getDefaultTeamValues) => {
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
 * Calculations
 */
const calculateGoalDifference = ({ GF, GA }) => GF - GA;

const calculatePoints = ({ wins, draws }) => wins * 3 + draws * 1;

const calculateWin = (GF, GA) => (GF > GA ? 1 : 0);

const calculateLoss = (GF, GA) => (GF < GA ? 1 : 0);

const calculateDraw = (GF, GA) => (GF === GA ? 1 : 0);

const calculateGamesPlayed = (wins, losses, draws) => {
  return wins + losses + draws;
};

/*
 * Sort Table
 */
const sortLeagueTableOnAscendingData = (leagueTable, sortVar) => {
  return new Map(
    [...leagueTable].sort((a, b) => {
      const sortVarA = a[1][sortVar];
      const sortVarB = b[1][sortVar];
      return sortVarB - sortVarA;
    })
  );
};

const sortLeagueTableOnDescendingData = (leagueTable, sortVar) => {
  return new Map(
    [...leagueTable].sort((a, b) => {
      const sortVarA = a[1][sortVar];
      const sortVarB = b[1][sortVar];
      return sortVarA - sortVarB;
    })
  );
};

export default getPremierLeagueTable;

/*
 * Exports For Testing
 */
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
