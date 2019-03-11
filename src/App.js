import React, { Component } from "react";
import getPremierLeagueTable from "./fetchData";

class App extends Component {
  state = { leagueTable: {} };

  componentDidMount() {
    getPremierLeagueTable().then(leagueData =>
      this.setState({
        leagueTable: leagueData
      })
    );
  }
  render() {
    const { leagueTable } = this.state;
    const leagueTableIsEmpty =
      Object.entries(leagueTable).length === 0 &&
      leagueTable.constructor === Object;

    return (
      <div className="App">
        {!leagueTableIsEmpty ? (
          <Table leagueTable={leagueTable} />
        ) : (
          <div>Loading</div>
        )}
      </div>
    );
  }
}

export default App;

const Table = ({ leagueTable }) => {
  let position = 0;
  return (
    <table id="premierLeagueTable">
      <tbody>
        <tr>
          <td>Pos</td>
          <td>Team</td>
          <td>Pld</td>
          <td>W</td>
          <td>D</td>
          <td>L</td>
          <td>GF</td>
          <td>GA</td>
          <td>GD</td>
          <td>Pts</td>
        </tr>
        {[...leagueTable].map(([key, value]) => {
          position++;
          return (
            <tr key={key}>
              <td>{position}</td>
              <td>{key}</td>
              <td>{value.played}</td>
              <td>{value.wins}</td>
              <td>{value.draws}</td>
              <td>{value.losses}</td>
              <td>{value.GF}</td>
              <td>{value.GA}</td>
              <td>{value.GD}</td>
              <td>{value.points}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
