const Discord = require("discord.js")
require('dotenv').config();
const http = require('http')

const token = process.env.DISCORD_TOKEN
if (!token) return console.log("No Discord token provided! Put one in your .env file")

const Shard = new Discord.ShardingManager('./index.js', { token } );
const guildsPerShard = 2000

http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Peelyris is running!');
}).listen(8301, '0.0.0.0', () => {
  console.log('Health check server running on port 8301');
});

Discord.fetchRecommendedShardCount(token, {guildsPerShard}).then(shards => {
    let shardCount = Math.floor(shards)
    console.info(shardCount == 1 ? "Starting up..." : `Preparing ${shardCount} shards...`)
    Shard.spawn({amount: shardCount, timeout: 60000}).catch(console.error)
    Shard.on('shardCreate', shard => {
        shard.on("disconnect", (event) => {
            console.warn(`Shard ${shard.id} disconnected!`); console.log(event);
        });
        shard.on("death", (event) => {
            console.warn(`Shard ${shard.id} died!\nExit code: ${event.exitCode}`);
        });
        shard.on("reconnecting", () => {
            console.info(`Shard ${shard.id} is reconnecting!`);
        });
            
    })
}).catch(e => {console.log(e.headers || e)})