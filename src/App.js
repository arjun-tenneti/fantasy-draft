import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Button, Table, TableHead, TableBody, TableRow, TableCell,
  TextField, ThemeProvider, createTheme, CssBaseline, Paper, Box, AppBar, Toolbar, IconButton, Menu, MenuItem, Paper as MuiPaper
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    background: { default: '#f4f6f8' }
  }
});

function SetupDraftPage({ teamNames, handleTeamNameChange, onDragEnd, startDraft, myTeamName, setMyTeamName }) {
  return (
    <Container sx={{ mt: 2 }}>
      <Typography variant="h4" gutterBottom>Setup Draft Order</Typography>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="teams">
          {(provided) => (
            <Box ref={provided.innerRef} {...provided.droppableProps}>
              {teamNames.map((name, index) => (
                <Draggable key={index} draggableId={`team-${index}`} index={index}>
                  {(provided) => (
                    <MuiPaper ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} sx={{ p: 1, mb: 1, display: 'flex', alignItems: 'center' }}>
                      <IconButton onClick={() => setMyTeamName(name)} sx={{ color: name === myTeamName ? 'gold' : 'gray', mr: 1 }}>
                        ⭐
                      </IconButton>
                      <TextField
                        label={`Team ${index + 1}`}
                        value={name}
                        onChange={(e) => handleTeamNameChange(index, e.target.value)}
                        fullWidth
                      />
                    </MuiPaper>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>
      <Button variant="contained" sx={{ mt: 2 }} onClick={startDraft}>Start Draft</Button>
    </Container>
  );
}

function AvailablePlayersPage({ players, draftPlayer, recommendation, fetchRecommendation, searchQuery, setSearchQuery, positionFilter, setPositionFilter }) {
  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPosition = positionFilter === 'All' || player.position === positionFilter;
    return matchesSearch && matchesPosition;
  });

  return (
    <>
      <Typography variant="h6">Available Players</Typography>
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mr: 2 }}
        />
        <TextField
          select
          label="Position"
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
          SelectProps={{ native: true }}
        >
          <option value="All">All Positions</option>
          <option value="QB">QB</option>
          <option value="RB">RB</option>
          <option value="WR">WR</option>
          <option value="TE">TE</option>
          <option value="K">K</option>
          <option value="DEF">DEF</option>
        </TextField>
      </Box>

      {recommendation && recommendation.name && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6">Recommended Pick:</Typography>
          <Typography>{recommendation.name} ({recommendation.position} - {recommendation.team})</Typography>
          <Typography>Projected Points: {recommendation.projected_points}</Typography>
        </Paper>
      )}

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Position</TableCell>
            <TableCell>Team</TableCell>
            <TableCell>Projected Points</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredPlayers.map(player => (
            <TableRow key={player.id}>
              <TableCell>{player.name}</TableCell>
              <TableCell>{player.position}</TableCell>
              <TableCell>{player.team}</TableCell>
              <TableCell>{player.projected_points}</TableCell>
              <TableCell><Button variant="outlined" onClick={() => draftPlayer(player.id)}>Draft</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}

function DraftBoardPage({ draftBoard }) {
  return (
    <>
      <Typography variant="h6">Draft Board</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Round</TableCell>
            <TableCell>Pick</TableCell>
            <TableCell>Drafter</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Position</TableCell>
            <TableCell>Team</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {draftBoard.map((pick, index) => (
            <TableRow key={index}>
              <TableCell>{pick.round}</TableCell>
              <TableCell>{pick.pick_number}</TableCell>
              <TableCell>{pick.drafter}</TableCell>
              <TableCell>{pick.name}</TableCell>
              <TableCell>{pick.position}</TableCell>
              <TableCell>{pick.team}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}

function MyTeamPage({ myTeam }) {
  const rosterSlots = {
    QB: null,
    RB1: null,
    RB2: null,
    WR1: null,
    WR2: null,
    TE: null,
    FLEX: null,
    K: null,
    DEF: null,
    BENCH: []
  };

  const flexEligible = (pos) => ['RB', 'WR', 'TE'].includes(pos);

  myTeam.forEach(player => {
    if (player.position === 'QB' && !rosterSlots.QB) {
      rosterSlots.QB = player;
    } else if (player.position === 'RB' && !rosterSlots.RB1) {
      rosterSlots.RB1 = player;
    } else if (player.position === 'RB' && !rosterSlots.RB2) {
      rosterSlots.RB2 = player;
    } else if (player.position === 'WR' && !rosterSlots.WR1) {
      rosterSlots.WR1 = player;
    } else if (player.position === 'WR' && !rosterSlots.WR2) {
      rosterSlots.WR2 = player;
    } else if (player.position === 'TE' && !rosterSlots.TE) {
      rosterSlots.TE = player;
    } else if (player.position === 'K' && !rosterSlots.K) {
      rosterSlots.K = player;
    } else if ((player.position === 'DEF' || player.position === 'D/ST') && !rosterSlots.DEF) {
      rosterSlots.DEF = player;
    } else if (!rosterSlots.FLEX && flexEligible(player.position)) {
      rosterSlots.FLEX = player;
    } else {
      rosterSlots.BENCH.push(player);
    }
  });

  const renderRow = (label, player) => (
    <TableRow>
      <TableCell>{label}</TableCell>
      {player ? (
        <>
          <TableCell>{player.name}</TableCell>
          <TableCell>{player.position}</TableCell>
          <TableCell>{player.team}</TableCell>
          <TableCell>{player.projected_points}</TableCell>
        </>
      ) : (
        <TableCell colSpan={4} sx={{ color: 'gray' }}>Empty</TableCell>
      )}
    </TableRow>
  );

  return (
    <>
      <Typography variant="h6">My Team (Roster View)</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Slot</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Position</TableCell>
            <TableCell>Team</TableCell>
            <TableCell>Projected Points</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {renderRow("QB", rosterSlots.QB)}
          {renderRow("RB1", rosterSlots.RB1)}
          {renderRow("RB2", rosterSlots.RB2)}
          {renderRow("WR1", rosterSlots.WR1)}
          {renderRow("WR2", rosterSlots.WR2)}
          {renderRow("TE", rosterSlots.TE)}
          {renderRow("FLEX", rosterSlots.FLEX)}
          {renderRow("K", rosterSlots.K)}
          {renderRow("DEF", rosterSlots.DEF)}
          {rosterSlots.BENCH.map((p, i) => renderRow(`BENCH ${i + 1}`, p))}
        </TableBody>
      </Table>
    </>
  );
}

function Navigation({ anchorEl, handleMenu, handleClose, navigate }) {
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton edge="start" color="inherit" onClick={handleMenu}><MenuIcon /></IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
          <MenuItem onClick={() => { navigate('/'); handleClose(); }}>Available Players</MenuItem>
          <MenuItem onClick={() => { navigate('/draft-board'); handleClose(); }}>Draft Board</MenuItem>
          <MenuItem onClick={() => { navigate('/my-team'); handleClose(); }}>My Team</MenuItem>
          <MenuItem onClick={() => { navigate('/setup'); handleClose(); }}>Setup Draft</MenuItem>
        </Menu>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>Fantasy Draft Assistant</Typography>
      </Toolbar>
    </AppBar>
  );
}

export default function App() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [draftBoard, setDraftBoard] = useState([]);
  const [myTeam, setMyTeam] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('All');
  const [anchorEl, setAnchorEl] = useState(null);
  const [teamNames, setTeamNames] = useState(['You', 'Team 2', 'Team 3', 'Team 4', 'Team 5', 'Team 6', 'Team 7', 'Team 8', 'Team 9', 'Team 10']);
  const [draftOrder, setDraftOrder] = useState([...teamNames]);
  const [myTeamName, setMyTeamName] = useState('You');

  const handleMenu = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const fetchPlayers = () => fetch("https://compassionate-youth-production.up.railway.app/available-players").then(res => res.json()).then(setPlayers);
  const fetchDraftBoard = () => fetch("https://compassionate-youth-production.up.railway.app/draft-board").then(res => res.json()).then(setDraftBoard);
  const fetchMyTeam = () => {
    fetch(`https://compassionate-youth-production.up.railway.app/my-team?drafter=${encodeURIComponent(myTeamName)}`)
      .then(res => res.json())
      .then(data => setMyTeam(data));
  };
  const fetchRecommendation = () => fetch("https://compassionate-youth-production.up.railway.app/recommendation").then(res => res.json()).then(setRecommendation);

 const draftPlayer = (playerId) => {
  const currentPick = draftBoard.length;
  const round = Math.floor(currentPick / draftOrder.length) + 1;
  const pickInRound = currentPick % draftOrder.length;

  let drafter;
  if (round % 2 === 1) {
    drafter = draftOrder[pickInRound];  // Normal order
  } else {
    drafter = draftOrder[draftOrder.length - 1 - pickInRound];  // Reverse order
  }

  const pickNumber = currentPick + 1;

  fetch("https://compassionate-youth-production.up.railway.app/draft-picks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      player_id: playerId,
      pick_number: pickNumber,
      round: round,
      drafter: drafter
    })
  }).then(() => {
    fetchPlayers();
    fetchDraftBoard();
    fetchMyTeam();
  });
};

  const resetDraft = () => {
    fetch("https://compassionate-youth-production.up.railway.app/reset-draft", { method: "DELETE" }).then(() => {
      fetchPlayers();
      fetchDraftBoard();
      fetchMyTeam();
      setRecommendation(null);
      navigate('/setup');
    });
  };

  const handleTeamNameChange = (index, value) => {
    const updated = [...teamNames];
    updated[index] = value;
    setTeamNames(updated);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(teamNames);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setTeamNames(items);
  };

  const startDraft = () => {
    setDraftOrder(teamNames);
    navigate('/');
  };

  useEffect(() => {
    fetchPlayers();
    fetchDraftBoard();
    fetchMyTeam();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navigation anchorEl={anchorEl} handleMenu={handleMenu} handleClose={handleClose} navigate={navigate} />
      <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="outlined" onClick={resetDraft}>Reset Draft</Button>
        <Button variant="contained" onClick={fetchRecommendation}>Get Recommendation</Button>
      </Box>
      <Container sx={{ mt: 2 }}>
        <Routes>
          <Route path="/" element={
            <AvailablePlayersPage players={players} draftPlayer={draftPlayer} recommendation={recommendation}
              fetchRecommendation={fetchRecommendation} searchQuery={searchQuery} setSearchQuery={setSearchQuery}
              positionFilter={positionFilter} setPositionFilter={setPositionFilter}
            />
          } />
          <Route path="/draft-board" element={<DraftBoardPage draftBoard={draftBoard} />} />
          <Route path="/my-team" element={<MyTeamPage myTeam={myTeam} />} />
          <Route path="/setup" element={
            <SetupDraftPage 
              teamNames={teamNames} 
              handleTeamNameChange={handleTeamNameChange}
              onDragEnd={onDragEnd} 
              startDraft={startDraft}
              setMyTeamName={setMyTeamName}
            />
          } />
        </Routes>
      </Container>
    </ThemeProvider>
  );
}
