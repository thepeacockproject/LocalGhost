# Localghost
This project consists of two parts: a patcher, and a server.

The server acts as a replacement of the IOI servers that Hitman usually connects to, and the patcher patches the game so it actually connects to this server instead of the official servers.

## Server

The server is written in NodeJS and serves as replacement for all `*.hitman.io` domains that the game connects to.
Without the patcher, the first connection the game makes is to `config.hitman.io` which serves some json that contains all other domains the game should use.
This server returns json that makes the game connect to the same domain for all requests.

To run the server, you need NodeJS installed. (Tested in NodeJS v12, but higher probably also works)

### Set-up
To install all the dependencies, run `npm install`. Now you can run `node serb.js` to start the server.

### Folder structure
- components (Parts of the server, split up into components)
- contractdata (Contracts - two, currently, one for each of the two ghost mode maps)
- menudata (Files that dictate the contents of game menus)
  - images (Images to display in menus - currently only 4, for the emotes)
  - menudata (Data to fill in the menus)
  - menusystem (Structure of the menus)
- node_modules (Server dependencies)
- static (Some miscellaneous files that the server sends)
- userdata (Data for all users that connect to the server, plus some default data)


## Patcher

The patcher is written in C# using .NET Framework 4.0. While the patcher is running, it patches all unpatched processes named "HITMAN2.EXE", once every second.
The 'Patching' involves changing some bytes to make the game do the following things:
- Connect to the specified host instead of the standard `config.hitman.io`.
This defaults to `localhost`, but you can also make the game connect to remote instances of a LocalGhost server by entering its IP/domain.
- Connect to that host using http instead of https
- Send an authorization header regardless of protocol. This contains session/user details send with every request.

### Set-up
For developers, the included .sln or .csproj files should be openable with visual studio.
For non-developers, I will try to include a prebuilt binary somewhere later.

## Missing features
- The server currently does not keep track of any stats, so the end screen will not show any.
- Matchmaking is not implemented. Inviting is the way to go.