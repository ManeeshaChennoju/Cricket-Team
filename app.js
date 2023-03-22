const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;
const convertObject = (db_object) => {
  return {
    playerId: db_object.player_id,
    playerName: db_object.player_name,
    jerseyNumber: db_object.jersey_number,
    role: db_object.role,
  };
};

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT * FROM cricket_team ORDER BY player_id;`;
  const playersList = await db.all(getPlayersQuery);
  const changedPlayerList = [];
  for (let obj of playersList) {
    changedPlayerList.push(convertObject(obj));
  }
  response.send(changedPlayerList);
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `INSERT INTO cricket_team (player_name,jersey_number,role)
  VALUES('${playerName}','${jerseyNumber}','${role}');`;
  const dbResponse = await db.run(addPlayerQuery);
  //   const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId};`;
  const player = await db.get(getPlayerQuery);
  const player_converted = convertObject(player);
  response.send(player_converted);
});

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `UPDATE cricket_team 
    SET player_name = '${playerName}', jersey_number = '${jerseyNumber}', role = '${role}'
    WHERE player_id = ${playerId};`;
  const dbResponse = await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `DELETE FROM cricket_team WHERE player_id = ${playerId}`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
