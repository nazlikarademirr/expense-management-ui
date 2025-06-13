type Transaction = {
  id: string;
  user: string;
  amount: number;
  date: Date;
  description: string;
};

export type { Transaction };

// type TransactionRequest = Omit<Transaction, 'id'>;

// export type { Transaction };

// function Teams() {
//   const [teams, setTeams] = useState<Team[]>();

//   const fetchTeams = () => {
//     const response : Team = await fetch("https://aa.bb");

//     const values = responses.map(x => {
//       id: x.id,
//       name: x.name,
//       type: parseTeamTypeFromResponse(x),
//     })

//     setTeams(values);
//   }

//   const addTeam = (team: Team) => {

//     const request : TeamRequest {
//       id: team.id,
//       role:
//     }

//     const response : Team = await fetch('aa.bb.com', request);

//     const team : Team = {
//       id: response.id,
//       name: response.name,
//       type: parseTeamTypeFromResponse(x)
//     }

//     handleAddTeam(team)
//   }
// }
