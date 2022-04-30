const Discord = require('discord.js');
const config = require('./config.json');
const dotenv = require('dotenv');
const consoleLogger = require('../utils/consoleLogger')
const netWrapper = require('./net-wrapper')
const train = require('../training/train')
const prefix = config.prefix;
const client = new Discord.Client();
const fs = require('fs')
const path = require('path')
const net = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../training/data/net.json"),"utf8"))
dotenv.config()

client.on('ready', () => {
    if(config.trainOnBoot) {
        train.loadTrainingData();
    }
    if(!(Object.entries(net).length === 0 || net === "")) {
        netWrapper.net.fromJSON(
            net
        );
    }
    consoleLogger.info(`Logged in as ${client.user.tag}!`)
    consoleLogger.info(`Online on ${client.guilds.cache.size} Guilds.`)

    client.user.setActivity("DyedSoftwareAI | $info");
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
	
    let embed = new Discord.MessageEmbed();

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
            
            channel.send("Bitte gib eine Kategorie an!")
            let categories = netWrapper.getCategories();

            categories.map(category => {
                embed.addField("ID: " + Object.keys(category), Object.values(category))
            })

            return channel.send(embed)

		}else if(status === 'category') {
            
            if(!netWrapper.categoryexistsWithId(msg.content)) {
                channel.send(`Diese Kategorie existiert noch nicht! Erstelle sie mit ${prefix}createCategory`)
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
                        
                        embed
                        .setFooter(`DyedSoftware | Open Source`,'https://i.imgur.com/aLaa4Qq.png')
                        .setTitle("DyedSoftware AI")
                        .setDescription("Training gestarted. Das kann eine Weile dauern!")
                        .addField("Training", "Gestarted")
                        .setColor('#ff0000')
                        channel.send(embed).then((message) => {
                            train.loadTrainingData()
                            embed.fields[0] = {name: "Training", value: "Beendet"}
                            message.edit(embed.setColor('#00ff00').setDescription(""))
                        })
                        return 
    
                    } else if(command === "hilfe") {
                        embed
                        .setTitle("Befehle")
                        .addField(prefix + "hilfe", "Zeigt dir diese Nachricht an!", false)
                        .addField(prefix + "createCategory <Name>", "Erstelle eine Kategorie", false)
                        .addField(prefix + "info", "Zeigt dir allgemeine Infos", false)
                        if(msg.member.hasPermission("ADMINISTRATOR")) {
                            embed
                            .addField(prefix + "train", "Trainiere die AI", false)
                            .addField(prefix + "stopInterval", "Stoppe das Intervalltraining", false)
                            .addField(prefix + "startInterval <Intervall (ms)> ", "Start das Intervalltraining", false)
                        }
                        channel.send(embed)
                    } else if(command === "stopInterval") {
                        if(!msg.member.hasPermission("ADMINISTRATOR")) return msg.reply("Dazu hast du keine Rechte!")
                        
                        if(train.botConfig.intervaltraining) {
                            train.stopIntervalTraining()
                            channel.send("Das Intervalltraining wurde deaktiviert!")
                        }else {
                            channel.send('Das Intervalltraining wurde bereits deaktiviert!')
                        }
                       return
                    }else {
                        channel.send(`Unbekannter Command. Nutze ${prefix}hilfe`)
                    }
                }else if(args.length === 2) {
                    if(command === "startInterval") {
                        if(!msg.member.hasPermission("ADMINISTRATOR")) return channel.send("Dazu hast du keine Rechte!")
                        
                        var interval =  parseInt(args[1])

                        if(typeof(interval) == 'number') {
                            if(!train.botConfig.intervaltraining) {
                                train.activateIntervalTraining(interval)
                                return channel.send(`Das Intervalltraining wurde aktiviert [${interval} ms]`)
                            }else {
                                return channel.send("Das Intervalltraining wurde bereits aktiviert!")
                            }
                        }else {
                            return channel.send('Bitte nutze **$startInterval <Interval (ms)>**')
                        }
                    }else if(command === "addCategory") {
                        
                        var category =  args[1]

                        if(!netWrapper.categoryexistsWithName(category)) {
                            netWrapper.addCategory(category)
                        return channel.send(`Die Kategorie **${category}** wurde erstell!`)
                        }else {
                            return channel.send(`Die Kategorie **${category}** existiert bereits!`)
                        }
                    }else {
                        return channel.send(`Unbekannter Command. Nutze ${prefix}hilfe`)
                    }
                }else {
                    return channel.send(`Unbekannter Command. Nutze ${prefix}hilfe`)
                }
                
            }else {
                if(netWrapper.net.isRunnable) {
                    var words = msg.content;
        
                    var sentence = words.replace(/[^a-zA-Z ]+/g, "").toLowerCase();
                    
                    return msg.channel.send(netWrapper.getResponse(netWrapper.net.run(sentence)));
                }else {
                    return channel.send('Ich wurde noch nicht trainiert!')
                }
            }
        }else {
            return channel.send('Ich lerne gerade!')
        }
	}
})

train.startIntervalTraining()

client.login(process.env.TOKEN);