# LocalGhost
This started off as a barebones server replacement for ghost mode only, but it has grown a bit since.

This project consists of two parts: a patcher, and a server.

The server acts as a replacement of the IOI servers that Hitman usually connects to, and the patcher patches the game so it actually connects to this server instead of the official servers.
- [Info for players](#players)
- [Info for server hosters](#server-hosters)
- [Info for developers](#developers)

Things of note:

- While using this, there is no connection at all to any IOI server (I think). This means you will not have your regular progression data, and right now, no progression at all. To still have some freedom in suit selection, all unlockable disguises are made available.
- The server sends a modified main menu, so the only thing available will be ghost mode, the options screen and possibly custom contracts.
- On mission completion the game will grant you a placeholder challenge 'Old rusty wrench'. I did that because the screen looks so empty otherwise.
- Ghost mode matchmaking is (still) not implemented. Inviting is the way to go.
- Hitman 1 support is not as complete as h2/h3 support yet. Check the h1 branch.

# Players
To use this software, download the patcher [here](https://gitlab.com/grappigegovert/localghost/-/jobs/artifacts/master/download?job=build_patcher).

Open the patcher and enter the IP address or domain name of the server you want to connect to.
Make sure the patcher is running while you start the game.

## Public servers : 
_These servers are kindly provided by members of the community. I am not responsible for any custom content they might host._

| Host | Server content | Server region |
| ------ | ------ | ------ |
| gm.hitmaps.com | Hosts the HITMAPS™ roulette (ghost mode might not work) | Eastern US |
| ghostmode.rdil.rocks | For playing ghost mode | Eastern US |

If you don't want to use a public server, you or your opponent will have to host one. Install NodeJS and follow [Server hosters](#server-hosters) to start the server. You'll have to port-forward port 80 (or setup a different port) for other players to be able to connect. Other players can then enter [your IP address](https://ident.me/) in the patcher to connect to your server.

It should be obvious, but two players have to be connected to the same server to play a match together.

Happy ghosting!

# Server hosters

To run a server, NodeJS version 12 or higher is needed.

First, you have to install all dependencies by running `npm install`. This is only needed once (or after some updates).
You can now start the server by running `node serb.js` or `npm start`.
It is possible to run the server on a different port than port 80 by setting the `PORT` environment variable.

### Custom tiles
In the menudata folder, there are two json files, `serverTile.template.json` and `featuredContracts.template.json`. These can be copied to `serverTile.json` and `featuredContracts.json` respectively and edited to suit your needs.
Each gameversion (h1, h2, or h3) uses its own version of the `featuredContracts.json` file.

`serverTile.json` controls the 'Current Server' livetile in the menu, and `featuredContracts.json` is a list of contractIds for contracts you want to display in the menu. Note that any contract you list here must have its contract data saved in the contractdata folder.


# Developers

## Server

The server is written in NodeJS and serves as replacement for all http(s) servers that the game connects to.
Without the patcher, the first connection the game makes is to `config.hitman.io` which serves some json that contains all other domains the game should use.
This server returns json that makes the game connect to the same domain for all requests.

Most parts of the server are split up into three versions: h1, h2, and h3; corresponding to the different releases of the game: HITMAN™ (2016), HITMAN™ 2, and HITMAN III.
\
When a request comes in, the request is assigned a req.gameVersion according to its steam/epic token appid, and routed to the version specific parts of the server, falling back to newer game versions if a request isn't handled by the version specific part.
This means that most of the code is in the h3 subdirectories, with only some version-specific bits in the h1/h2 folders.

To run the server, you need NodeJS installed. (v12 or up)

### Set-up
To install all the dependencies, run `npm install`. Now you can run `node serb.js` to start the server.

### Folder structure
- components (Parts of the server, split up into components)
- contractdata (Contracts - two, currently, one for each of the two ghost mode maps)
- menudata (Files that dictate the contents of game menus)
  - h1/h2/h3 a subfolder for each of the game versions
    - images (Images to display in menus - currently only 4, for the emotes)
    - menudata (Data to fill in the menus)
    - menusystem (Structure of the menus)
- node_modules (Server dependencies)
- static (Some miscellaneous files that the server sends)
- userdata (Data for all users that connect to the server, plus some default data)

## Patcher

The patcher is written in C# using .NET Framework 4.0. While the patcher is running, it patches all unpatched processes named "HITMAN.EXE", "HITMAN2.EXE", or "HITMAN3.exe" once every second.
The 'Patching' involves changing some bytes to make the game do the following things:
- Connect to the specified host instead of the standard `config.hitman.io`. (By changing the config var `Online_VersionConfigDomain`)
This defaults to `localhost`, but you can also make the game connect to remote instances of a LocalGhost server by entering its IP/domain.
- Connect to that host using http instead of https
- Send an authorization header regardless of protocol. This contains session/user details send with every request.
- Make the game not disconnect on receiving invalid/incomplete dynamic resources (By changing the config var `OnlineResources_ForceOfflineOnFailure`)
And optionally also:
- Disable the game's certificate pinning for inspecting network traffic.

### Set-up
The included .sln or .csproj files should be openable with visual studio. Nothing special.

## License
All code included in this project is licensed under the zlib license.
A copy of the zlib license can be found in the LICENSE file

# Credits

Coded for the most part by @grappigegovert, with contributions from:
 - @mike-koch
 - @hardIware
 - @Notex

Check out the [Contributors tab for more info](https://gitlab.com/grappigegovert/localghost/-/graphs/master)
