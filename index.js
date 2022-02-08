require('dotenv').config();

const ytdl = require('ytdl-core');
const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();

const cmdPrefix = '/';
const musicChannels = require('./music_channels.json');
const mentionReplys = require('./mention_replys.json');

let voiceConnection = false;
let isLoading = false;
// const songs = [];
let currentSong = false;

client.on('ready', () => {
  console.log(`Bot started. name: ${client.user.tag}`);
});

client.on('message', async (message) => {
  const { author, member, channel, content } = message;

  if (author.bot || message.type === 'REPLY') return;

  if (message.mentions.has(client.user.id)) {
    return message.reply(mentionReplys[Math.floor(Math.random() * mentionReplys.length)]);
  }

  if (!musicChannels[channel.id]) return;

  if (content.startsWith(cmdPrefix)) {
    const splitted = content.replace('/', '').split(' ');

    let info = false;
    switch (splitted[0]) {
      case 'yt':
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) return message.reply(`Lépj be egy vóice szobába elsőnek!`);
        if (isLoading) return message.reply('Tőttök várj kicsit');
        message.reply('videó betőtése');
        isLoading = true;

        if (!voiceConnection) voiceConnection = await voiceChannel.join();
        if (!splitted[1]) return message.reply('Nem attal meg linket');

        // ytdl('https://www.youtube.com/watch?v=-SW72PMz370').pipe(fs.createWriteStream('karics.mp3'));

        console.log('validate', ytdl.validateURL(splitted[1]));

        if (!ytdl.validateURL(splitted[1])) {
          isLoading = false;
          return message.reply('Hipás a link széptesvér');
        }

        info = await ytdl.getInfo(splitted[1], { format: 'mp3', quality: 18 });

        console.log(info);

        currentSong = {
          url: splitted[1],
          info,
        };

        const res = ytdl.downloadFromInfo(info);
        voiceConnection.play(res);
        isLoading = false;

        message.reply('Beraktad');
        break;
      case 'stop':
        if (voiceConnection) voiceConnection.disconnect();
        voiceConnection = false;
        break;
      case 'ytmp3':
        if (!splitted[1]) return message.reply('Nem attal meg linket');

        // info = await ytdl.getInfo(splitted[1], { format: 'mp3', quality: 18 });

        // const name = info.videoDetails.title.replaceAll(' ', '_')
        // fs.createWriteStream()
        const title = await promiseTitle(splitted[1]);
        title = title.replace(/[^a-zA-Z0-9]/g, '_');
        // ytdl(splitted[1], { filter: 'audioonly' }).pipe(fs.createWriteStream(file));

        // message.channel.send('It a zene letotve', {
        //   files: [file],
        // });

        let stream = ytdl(splitted[1], { filter: 'audioonly' });
        let aData = [];

        stream.on('data', function (data) {
          aData.push(data);
        });

        stream.on('end', function () {
          let buffer = Buffer.concat(aData);
          // let title = results[0].replace(/[^a-zA-Z0-9]/g, '_');
          // console.log(title);
          message.channel.send('it a zene:', {
            files: [
              {
                attachment: buffer,
                name: title + '.mp3',
              },
            ],
          });
        });
        // const data = ytdl.downloadFromInfo(info);
        // console.log(data);
        break;
      default:
        console.log('ismeretlen parancs', splitted);
        break;
    }

    console.log('is command', content);
  }

  // console.log(channel);

  // console.table(message.channel);
  // message.reply()
});

client.on('voiceStateUpdate', (oldState, newState) => {
  if (newState && !newState.channel) {
    voiceConnection = false;
  }
});

client.login(process.env.TOKEN);
