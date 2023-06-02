const users = new Map([
	['1', { id: '1', name: 'Paul Walker', age: 20 }],
	['2', { id: '2', name: 'Jonny Deep', age: 41 }],
	['3', { id: '3', name: 'Robert Peterson', age: 12 }],
	['4', { id: '4', name: 'Walter Smith', age: 5 }],
	['5', { id: '5', name: 'Johanna Cyrus', age: 64 }],
	['6', { id: '6', name: 'Jhousha Wiseman', age: 78 }],
	['7', { id: '7', name: 'Uncle Roger', age: 33 }],
	['8', { id: '8', name: 'Guga', age: 59 }],
	['9', { id: '9', name: 'Pauleane', age: 53 }],
	['10', { id: '10', name: 'Adam Haris', age: 24 }],
]);

export const db = new Map([['users', users]]);
