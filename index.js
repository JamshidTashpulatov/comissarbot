const Telegraf = require('telegraf');
const mongoose = require('mongoose');
mongoose.connect(
        'mongodb://localhost:27017/comissar', {
            useNewUrlParser: true
        }
    )
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

const User = mongoose.model('users', {
    user_id: String,
    chat_id: String,
    restrict: {
        type: Boolean,
        default: true,
    },
});

const bot = new Telegraf('YOUR_BOT_TOKEN');
const date = new Date();
bot.start((ctx) => ctx.reply('Assalomu alaykum! Okala u bu xizmat bolsa yordam deb yozinglar.'))
console.log(date.setTime(date.getTime() + (40 * 1000) / 1000));
bot.hears('ruhsat', async ctx => {

    const User_id = `${ctx["update"]["message"]['from']['id']}`;
    // const idOfChat = ctx["update"]["message"]["chat"]['id'];
    // let r = await ctx.telegram.getChatMember(idOfChat, User_id);

    if (ctx["update"]["message"]["chat"]["first_name"]) {


        const check_user = await User.find({
            user_id: User_id
        }).exec();

        // console.log( check_user );

        if (check_user[0] && check_user[0]["restrict"]) {

            try {

                ctx.telegram.promoteChatMember(
                    parseInt(check_user[0].chat_id), //chat id
                    parseInt(check_user[0].user_id), // massage yozgan user idisi
                    {
                        can_send_message: true
                    }
                );

                ctx.reply(`hurmatli ${ctx["update"]["message"]["chat"]["first_name"]} siz read-only rejimidan chiqdingiz bemalol yozishingiz mumkun`)

            } catch (err) {

                console.log(err);
            }
        }
    }
    // console.log( `\n ------------------------------------ \n` );
});

bot.on('message', async(ctx) => {

    try {

        const user = await ctx.telegram.getChatMember(ctx.chat.id, ctx.message.from.id);

        const message = await ctx.message;

        const check_user = await User.find({
            user_id: ctx.message.from.id
        });

        console.log(message);
        console.log('--------------------------------\n')


        if (message && user.status == 'member') {

            if (check_user.length) {

                // console.log( `BLABLABLALBALBALBLA` );
            } else {

                ctx.telegram.restrictChatMember(
                    ctx.chat.id, //chat id
                    ctx.message.from.id, // massage yozgan user idisi
                    {
                        until_date: (new Date()).getTime() + 45
                    }
                );

                ctx.reply(`${message.from.first_name} ${message.from.last_name} siz 2oyga read-only rejmga tushdingiz`);

                let user = new User({
                    user_id: ctx.message.from.id,
                    chat_id: ctx.chat.id
                });

                user.save().then(re => {

                        console.log(`user saved`);
                    })
                    .catch(err => {
                        throw err;
                    });
            }
        } else if (message && message.new_chat_member) {
            // get id user and save to database

            if (!check_user.length) {

                ctx.telegram.restrictChatMember(
                    ctx.chat.id, //chat id
                    ctx.message.from.id, // massage yozgan user idisi
                    {
                        until_date: (new Date()).getTime() + 45
                    }
                );

                let user = new User({
                    user_id: ctx.message.from.id,
                    chat_id: ctx.chat.id
                });

                user.save().then(re => {

                        console.log(`user saved`);
                    })
                    .catch(err => {
                        throw err;
                    });


            }

            ctx.reply(`${message.new_chat_member.first_name} ${message.new_chat_member.last_name} Guruxumizga Hush kelibsiz siz 2oyga read-only rejmga tushdingiz`);

        } else if (message && message.left_chat_member) {
            //leveled member
        }
    } catch (err) {

        throw err;
    }

    // console.log( `------------------------------------------------------\n` )

});


bot.catch((err) => {
    console.log('Xatolik sodir boldi:', err)
})

bot.launch()
