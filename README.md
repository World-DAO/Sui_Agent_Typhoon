# Welcome to Colyseus!

This project has been created using [⚔️ `create-colyseus-app`](https://github.com/colyseus/create-colyseus-app/) - an npm init template for kick starting a Colyseus project in TypeScript.

[Documentation](http://docs.colyseus.io/)

## :crossed_swords: Usage

Start the server ( runs `ts-node-dev index.ts`):
```shell
npm start
```

Run test cases:
```shell
npm test
```

Change your database config in `.env` 
```
DATABASE_URL=

// DATABASE_URL=mysql://root@127.0.0.1:3306/Bar

JWT_SECRET="f9c8e7d1a6b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef12"
```

and run:
```shell
source .env
```

run SQL database script in `sql` folder to create tables.

