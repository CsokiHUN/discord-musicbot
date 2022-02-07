require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();

const cmdPrefix = '/';
const musicChannels = require('./music_channels.json');
const mentionReplys = require('./mention_replys.json');

let voiceConnection = false;

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
    const splitted = content.replaceAll('/', '').split(' ');

    switch (splitted[0]) {
      case 'yt':
        // console.log(member.voice.channel);
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) {
          return message.reply(`Lépj be egy vóice szobába elsőnek!`);
        }
        message.reply('videó betőtése');

        if (!voiceConnection) voiceConnection = await voiceChannel.join();
        voiceConnection.play('./music.mp3');
        break;
      case 'stop':
        if (voiceConnection) voiceConnection.disconnect();
        voiceConnection = false;
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
