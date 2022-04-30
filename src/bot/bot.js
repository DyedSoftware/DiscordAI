const Discord = require('discord.js');
const config = require('./config.json');
const dotenv = require('dotenv');
const consoleLogger = require('../utils/consoleLogger')
const netWrapper = require('./net-wrapper')
const train = require('../training/train')
const prefix = config.prefix;
const client = new Discord.Client(); 
dotenv.config()

client.on('ready', () => {
    if(config.trainOnBoot) {
        train.loadTrainingData();
    }
    consoleLogger.info(`Logged in as ${client.user.tag}!`)
    consoleLogger.info(`Online on ${client.guilds.cache.size} Guilds.`)

    client.user.setPresence({
        game: {
            name: `Dyedsoftware AI | ${prefix}info`,
            application_id: '001',
            details: "Idle",
            type: 0,
            startTimestamp: new Date()
        },
    });
});

let status = 'input';
let input = '';
let output = '';

client.on('message', msg => {
    
    var sender = msg.author;
    if(sender.bot) return;

    let messageContent = msg.content;
    let args = messageContent.substring(prefix.length).split(" ");
    let command = args[0];
    let channel = msg.channel;
	
	if(channel.id === config.trainChannelId) {
		if(status === 'input') {
            input = msg.content
			return status = 'output';

		}else if(status === 'output') {
			status = 'category';
            output = msg.content
            
            let embed = new Discord.MessageEmbed()
            embed
            .setFooter(`DyedSoftware | Open Source`,'https://i.imgur.com/aLaa4Qq.png')
            .setTitle('Categories');
            
            channel.send("Please enter a category")
            let categories = netWrapper.getCategories();

            categories.map(category => {
                embed.addField("ID: " + Object.keys(category), Object.values(category))
            })

            return channel.send(embed)

		}else if(status === 'category') {
            
            if(!netWrapper.categoryexistsWithId(msg.content)) {
                msg.reply(`Diese Kategorie existiert noch nicht! Erstelle sie mit ${prefix}createCategory`)
                return status = 'input'
            }else {
                train.saveTrainingData(input, msg.content, output)
                channel.send('Saved')
                return status = 'input'
            }
        }
    }

    if (channel.id === config.conversationChannelId) {
        if(!train.training) {
            if(messageContent.startsWith(prefix)) {
                if(args.length === 1) {
                    if(command === "info") {
                        let embed = new Discord.MessageEmbed()
                        embed.setFooter(`DyedSoftware | Open Source`,'https://i.imgur.com/aLaa4Qq.png')
                        .setTitle("DyedSoftware AI")
                        .setDescription("Informationen über die DyedSofware AI")
                        .addField("Base", "Brain.js [" + netWrapper.net.model.allMatrices.length + "]")
                        .addField("Runnable", netWrapper.net.isRunnable)
                        .addField("Initial layers", netWrapper.net.initialLayerInputs.length)
                        .addField("Training iterations", netWrapper.net.trainOpts.iterations)
                        .addField("Hidden layers", netWrapper.net.options.hiddenLayers)
                        .addField("IntervalTraining", train.botConfig.intervaltraining);
                        
                        return channel.send(embed);

                    }else if(command === "train") {
                        if(!msg.member.hasPermission("ADMINISTRATOR")) return msg.reply("Dazu hast du keine Rechte!")
                        let embed = new Discord.MessageEmbed()
                        embed.setFooter(`DyedSoftware | Open Source`,'https://i.imgur.com/aLaa4Qq.png')
                        .setTitle("DyedSoftware AI")
                        .setDescription("Started training. This might take a while!")
                        .addField("Training", "Started")
                        .setColor('#ff0000')
                        channel.send(embed).then((message) => {
                            train.loadTrainingData()
                            embed.fields[0] = {name: "Training", value: "Completed"}
                            message.edit(embed.setColor('#00ff00').setDescription(""))
                        })
                        return 
    
                    }else if(command === "stopInterval") {
                        if(!msg.member.hasPermission("ADMINISTRATOR")) return msg.reply("Dazu hast du keine Rechte!")
                        
                        if(train.botConfig.intervaltraining) {
                            train.stopIntervalTraining()
                            msg.reply("Deactivated Intervaltraining!")
                        }else {
                            msg.reply('Intervaltraining is already deactivated')
                        }
                       return
                    }else {
                        msg.reply(`Unbekannter Command. Nutze ${prefix}hilfe`)
                    }
                }else if(args.length === 2) {
                    if(command === "startInterval") {
                        if(!msg.member.hasPermission("ADMINISTRATOR")) return msg.reply("Dazu hast du keine Rechte!")
                        
                        var interval =  parseInt(args[1])

                        if(typeof(interval) == 'number') {
                            if(!train.botConfig.intervaltraining) {
                                train.activateIntervalTraining(interval)
                                return msg.reply(`Started Intervaltraining Interval: ${interval} ms`)
                            }else {
                                return msg.reply("Intervaltraining is already activated")
                            }
                        }else {
                            return msg.reply('Bitte nutze $startInterval <Interval (ms)>')
                        }
                    }else if(command === "addCategory") {
                        
                        var category =  args[1]

                        if(!netWrapper.categoryexistsWithName(category)) {
                            netWrapper.addCategory(category)
                            return msg.reply('Create category')
                        }else {
                            return msg.reply(`Die Kategorie **${category}** existiert bereits!`)
                        }
                    }else {
                        return msg.reply(`Unbekannter Command. Nutze ${prefix}hilfe`)
                    }
                }else {
                    return msg.reply(`Unbekannter Command. Nutze ${prefix}hilfe`)
                }
                
            }else {
                if(netWrapper.net.isRunnable) {
                    var words = msg.content;
        
                    var sentence = words.replace(/[^a-zA-Z ]+/g, "").toLowerCase();
                    
                    return msg.channel.send(netWrapper.getResponse(netWrapper.net.run(sentence)));
                }else {
                    return msg.reply('I am not trained!')
                }
            }
        }else {
            return msg.reply('I am currently training!')
        }
	}
})

train.startIntervalTraining()

client.login(process.env.TOKEN);