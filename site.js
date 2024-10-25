//initialize kaboom
kaboom ({
    global: true,
    fullscreen: true,
    //width: window.screen.width,
    //height: window.screen.height,
    scale: 2,
    debug: true,
    //canvas: document.getElementById('bod'),
    //background color
    clearColor: [0, 0, 0, 1]
});

//drawing out maps, load in some sprites (moveable images)
// loadRoot('https://i.imgur.com/');
//loadSprite('coin', 'https://i.imgur.com/wbKxhcd.png');
loadSprite('coin', "https://i.imgur.com/ivWrIF5.png", {
    sliceX: 5.9, // Number of frames horizontally
    sliceY: 1, // Number of frames vertically
    anims: {
        spin: {
            from: 0,
            to: 5,
            loop: true,
            speed: 2 // Adjust speed to match your GIF's frame rate
        }
    }
});
loadSprite('shroom', 'https://i.imgur.com/KP03fR9.png');
loadSprite('brick', 'https://i.imgur.com/pogC9x5.png');
loadSprite('block', 'https://i.imgur.com/M6rwarW.png');
loadSprite('mario', 'https://i.imgur.com/Wb1qfhK.png');
loadSprite('mushroom', 'https://i.imgur.com/0wMd92p.png');
loadSprite('surprise', 'https://i.imgur.com/gesQ1KP.png');
loadSprite('unboxed', 'https://i.imgur.com/bdrLpi6.png');
loadSprite('pipe-top-left', 'https://i.imgur.com/ReTPiWY.png');
loadSprite('pipe-top-right', 'https://i.imgur.com/hj2GK4n.png');
loadSprite('pipe-bottom-right', 'https://i.imgur.com/nqQ79eI.png');
loadSprite('pipe-bottom-left', 'https://i.imgur.com/c1cYSbt.png');
loadSprite('block2', 'https://i.imgur.com/kOS5Dii.png');
loadSprite("speechDown", "https://i.imgur.com/Dqjrt5J.png");
loadSprite("aboutBubble", "https://i.imgur.com/aq1yMxJ.png");

// Load the moving sprite (spritesheet with frames for the GIF animation)
loadSprite('moving', "https://i.imgur.com/hS4Xfsq.png", {
    sliceX: 3.06, // Number of frames horizontally
    sliceY: 1, // Number of frames vertically
    anims: {
        run: {
            from: 0,
            to: 2,
            loop: true,
            speed: 3 // Adjust speed to match your GIF's frame rate
        },
        jump: {
            from: 1,
            to: 1
        },
        idle: {
            from: 2,
            to: 2
        }
    }
});

// Loag goomba walking gif
loadSprite('goomba', "https://i.imgur.com/H2JgYB7.png", {
    sliceX: 2, // Number of frames horizontally
    sliceY: 1, // Number of frames vertically
    anims: {
        run: {
            from: 0,
            to: 1,
            loop: true,
            speed: 4 // Adjust speed to match your GIF's frame rate
        }
    }
});

/*load sounds for game
loadRoot("./");
loadSound("ouch", "smb_fireworks.mp3");*/
var audio; // to play sounds
var HTMLaudio = document.getElementById("aud"); // get the HTML audio so i can pause it when mario dies 

//sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

scene("game", ({level, score}) => {
    let isOnPipe = false;
    let pipeMessageShown = false;
    //layers: background, object, UI, default
    layers(['bg', 'obj', 'ui'], 'obj');

    //this variable determines where the pipe should lead to (resume/education/restart... etc)
    var type = 0;

    //create map / gameBoard
    const map  = [
        "                                                             = ",
        "                                                               ",
        "                                                             = ",
        "      %    = * = 7 =                A     R     G     C        ",
        "                                                             = ",
        "                                                               ",
        "                                                             = ",
        "                                                               ",
        "                 ^   ^       -+                              = ",
        "                             ()                                ",
        "= = = = = = = = = = = = =    = = = = = = = = = = = = = = = = = "
    ];
    //variable to determine if mario is jumping
    var isJumping = true;
    //varible to see if mario is running
    var isRunning = false;
    //assign sprites
    const levelCfg = {
        //set height and width to 20 px each
        width: 20,
        height: 20,
        // set the = signs in the map constant to the 'block' sprite
        '=': [sprite('block'), solid(), scale(2, 2)],
        'A': [sprite('block2'), 'about', solid(), scale(2, 2)],
        'R': [sprite('block2'), 'resume', solid(), scale(2, 2)],
        'G': [sprite('block2'), 'github', solid(), scale(2, 2)],
        'C': [sprite('block2'), 'contact', solid(), scale(2, 2)],
        '$': [sprite('coin'), 'coin', scale(0.2)],
        'S': [sprite('coin'), 'coin2', scale(0.2)],
        '%': [sprite('surprise'), solid(), 'coin-surprise', scale(2)],
        '7': [sprite('surprise'), solid(), 'coin-surprise2', scale(2)],
        '*': [sprite('surprise'), solid(), 'mushroom-surprise', scale(2)],
        '}': [sprite('unboxed'), solid(), scale(2)],
        '(': [sprite('pipe-bottom-left'), solid(), 'pipe'],
        ')': [sprite('pipe-bottom-right'), solid(), 'pipe'],
        '-': [sprite('pipe-top-left'), solid(), 'pipe'],
        '+': [sprite('pipe-top-right'), solid(), 'pipe'],
        '^': [sprite('goomba'), solid(), scale(0.37), 'dangerous'],
        '0': [sprite('mushroom'), solid(), 'mushroom', body(), scale(2)],
        //'9': [sprite('aboutMe'), solid(), 'aboutMe', scale(0.1)],
        //'8': [sprite('resume'), solid(), 'resume', scale(0.1)],
        //'7': [sprite('projects'), solid(), 'projects', scale(0.1)],
        //'4': [sprite('education'), solid(), 'education', scale(0.1)],
        '1': [sprite('speechDown'), 'speechDown', layer('bg')],
        //'2': [sprite('speechLeft'), 'speechLeft', layer('bg')]
    };

    const gameLevel = addLevel(map, levelCfg);

    //display score in game
    const scoreLabel = add([
        text('Score: 0'),
        pos(30,6),
        layer('ui'),
        {
            value: 0
        }
    ]);

    const about = add([
        text('About Me'),
        pos(720, 50),
        layer('ui')
    ]);

    const resume = add([
        text('Resume'),
        pos(848, 50),
        layer('ui')
    ]);

    const github = add([
        text('GitHub'),
        pos(968, 50),
        layer('ui')
    ]);

    const contactMe = add([
        text('Contact Me'),
        pos(1073, 50),
        layer('ui')
    ]);

    const thisWay = add([
        text('This Way! ---->'),
        pos(70, 120),
        layer('ui')
    ]);

    const killTheGoombas = add([
        text('Jump On The Goombas!'),
        pos(70, 140),
        layer('ui')
    ]);

    const hitTheBlocks = add([
        text('Hit the blocks! -->'),
        pos(500, 120),
        layer('ui')
    ]);

    const goIntoPipe = add([
        text(''),
        pos(715, 150), // Adjust position as needed
        layer('ui'),
        scale(0.9, 0.9)
    ]);

    //display level in game
    add([text('Level: '+ level, pos(4,6))]);

    //make mario big!
    function big(){
        let timer =0;
        let isBig = false;
        return {
            //kaboom method
            update() {
                if (isBig){
                    //dt() is a kaboom function, its the delta time since the last frame
                    timer -= dt();
                    if (timer<= 0){
                        //make mario small again if timer is <= 0 (mushroom time runs out)
                        this.smallify();
                    }
                }
            },
            isBig(){
                return isBig;
            },
            smallify(){
                this.scale = vec2(0.2);
                timer = 0;
                isBig = false;
                JUMP_FORCE = 450;
            },

            biggify(time){
                this.scale = vec2(0.4);
                timer = time;
                isBig = true;
                JUMP_FORCE = 550;
            }
        }
    }

    //create mario player
    const player = add ([

        //create mario image in game
        sprite('moving'),

        solid(), 

        scale(0.2, 0.2),
        //marios starting position
        pos(30,0),

        //causes mario to fall into position
        body(),

        //big function
        big(),
        //helps with glitches that might be caused from body()
        origin('bot')
    ]);


    //lets make the mushroom move
    action('mushroom', (m) => {
        m.move(30,0);
    })

    player.on("headbump", (obj) => {
        //if the object he headbumps has tag 'coin-surprise
        if (obj.is('coin-surprise')){
            type=0;
            //spawn coin
            const coin = gameLevel.spawn('$', obj.gridPos.sub(-0.1,2)); //obj.gridPos.sub(0,1) means sub the new object where the old one was plus coordinates (x,y)
            destroy(obj); //get rid of old object on gameboard
            gameLevel.spawn('}', obj.gridPos); //spawn a new block at location obj.gridPos (position where obj was)
            coin.play('spin');
        }
        if (obj.is('coin-surprise2')){
            type=0;
            //spawn coin
            const coin2 = gameLevel.spawn('S', obj.gridPos.sub(-0.1,2)); //obj.gridPos.sub(0,1) means sub the new object where the old one was plus coordinates (x,y)
            destroy(obj); //get rid of old object on gameboard
            gameLevel.spawn('}', obj.gridPos); //spawn a new block at location obj.gridPos (position where obj was)
            coin2.play('spin');
        }
        //same thing but for mushroom block
        if (obj.is('mushroom-surprise')){
            type=0;
            //spawn mushroom
            gameLevel.spawn('0', obj.gridPos.sub(0,2)); //obj.gridPos.sub(0,1) means sub the new object where the old one was plus coordinates (x,y)
            destroy(obj); //get rid of old object on gameboard
            audio = new Audio("smb_powerup_appears.wav");
            audio.play();
            gameLevel.spawn('}', obj.gridPos); //spawn a new block at location obj.gridPos (position where obj was)
        }

        if (obj.is('about')){
            type = 1;
            destroyAll("speechDown");
            const bubble = gameLevel.spawn('1', obj.gridPos.sub(1.5,-3));
            bubble.scale = vec2(0.3, 0.3);
            goIntoPipe.text = 'Stand on the pipe \n and press down on \n your keyboard!';
            goIntoPipe.pos = vec2(715, 150);
            pipeMessageShown = true;
        }

        if (obj.is('resume')){
            type = 2;
            destroyAll("speechDown");
            const bubble = gameLevel.spawn('1', obj.gridPos.sub(1.5,-3));
            bubble.scale = vec2(0.3, 0.3);
            goIntoPipe.text = 'Stand on the pipe \n and press down on \n your keyboard!';
            goIntoPipe.pos = vec2(834, 150);
            pipeMessageShown = true;
        }

        if (obj.is('github')){
            type = 3;
            destroyAll("speechDown");
            const bubble = gameLevel.spawn('1', obj.gridPos.sub(1.5,-3));
            bubble.scale = vec2(0.3, 0.3);
            goIntoPipe.text = 'Stand on the pipe \n and press down on \n your keyboard!';
            goIntoPipe.pos = vec2(956, 150);
            pipeMessageShown = true;
        }

        if (obj.is('contact')){
            type = 4;
            destroyAll("speechDown");
            const bubble = gameLevel.spawn('1', obj.gridPos.sub(1.5,-3));
            bubble.scale = vec2(0.3, 0.3);
            goIntoPipe.text = '  647 745 4465 \n \n  matthewmforget\n    @gmail.com';
            goIntoPipe.pos = vec2(1076, 150);
            pipeMessageShown = true;
        }
    });

    //kaboom method collides(), lets use it to make mario big when he collides with an object with tag 'mushroom'
    player.collides('mushroom', (m) => {
        destroy(m);
        player.biggify(7);
        audio = new Audio("smb_powerup.wav");
        audio.play();
    });

    //same thing but with a coin
    player.collides('coin', (c) => {
        destroy(c);
        audio = new Audio("smb_coin.wav");
        audio.play();
        scoreLabel.value += 5;
        scoreLabel.text = 'Score: ' + scoreLabel.value;
    });

        //same thing but with a coin
    player.collides('coin2', (c) => {
        destroy(c);
        audio = new Audio("smb_coin.wav");
        audio.play();
        scoreLabel.value += 5;
        scoreLabel.text = 'Score: ' + scoreLabel.value;
    });

    //move the bowsers!
    action('dangerous', (d) => {
        d.move(-15,0);
    });

    //if mario falls in the hole, go to lose screen
    player.action(() => {
        //make the camera always positioned on the players position
        camPos(player.pos);
        //if players position is less than a certain value, go to lose screen
        if (player.pos.y >= 400){
            HTMLaudio.pause();
            audio = new Audio("smb_mariodie.wav")
            audio.play();
            go('lose', ({score: scoreLabel.value}));
        }
    });

    //make the pipe available to go into
    player.collides('pipe', () =>{
        isOnPipe = true;
        keyPress('down', () =>{
            if (isOnPipe) {
                if ((!isJumping) && (type==0 || type==4)){
                    HTMLaudio.pause();
                    audio = new Audio("smb_pipe.wav");
                    audio.play();
                    wait(1, () =>{
                        HTMLaudio.play();
                        go('game', {
                            level: level+1,
                            score: scoreLabel.value
                        });
                    })
                }

                else if (type==1 && !(isJumping)){
                    audio = new Audio("smb_pipe.wav");
                    audio.play();
                    wait(1, () =>{
                        HTMLaudio.pause();
                        go('gameAbout', { level: level+1, score: scoreLabel.value }); 
                    })
                }
                else if (type==2 && !(isJumping)){
                    audio = new Audio("smb_pipe.wav");
                    audio.play();
                    wait(1, () =>{
                        window.open("Resume_coding.pdf", "_blank");
                    })
                }
                else if (type==3 && !(isJumping)){
                    audio = new Audio("smb_pipe.wav");
                    audio.play();
                    wait(1, () =>{
                        window.open("https://github.com/matthewmforget", "_blank");
                    })
                }
            }
        });
    });


    // if they collid with an object with tag 'dangerous', go to lose screen and display score, or destroy it
    player.collides('dangerous', (d) => {
        //if player is jumping, destroy bowser
        if (isJumping){
            destroy(d);
            audio = new Audio("smb_fireworks.mp3");
            audio.play();
        }
        else {
            HTMLaudio.pause();
            audio = new Audio("smb_mariodie.wav");
            audio.play();
            go('lose', {score: scoreLabel.value});
        }
    });

    //if player is on ground, make isJumping = false
    player.action(() => {
        //if mario is on the ground
        if (player.grounded()){
            isJumping = false;
            if (!isRunning) {
                player.stop();
                player.play('idle');
            }
        }

        else {
            isOnPipe = false;
        }
    })

    //lets assign keyboard actions to events
    //keyDown is a kaboom method
    const MOVE_SPEED = 120;
    keyDown('left', () => {
        //move(speed on x-axis, speed on y-axis)
        player.move(-MOVE_SPEED, 0);
        if (!isJumping && player.curAnim() !== "run") {
            player.play('run');
            player.anchor = vec2(0.5, 0.5); // Centered
            isRunning = true;
        }
    })
    //move right
    keyDown('right', (m) => {
        //move(speed on x-axis, speed on y-axis)
        //player.use(sprite('mario_running'), scale(5));
        player.move(MOVE_SPEED, 0);
        if (!isJumping && player.curAnim() !== "run") {
            player.play('run');
            player.anchor = vec2(0.5, 0.5); // Centered
            isRunning = true;
        }
    })
    //jumping
    let JUMP_FORCE=450;
    keyDown('space', () => {
        isOnPipe = false;
        //grounded() checked if player is on the ground
        if (player.grounded()){
            //jump(jump speed)
            audio = new Audio("smb_jump-small.wav");
            audio.play();
            player.jump(JUMP_FORCE);
            player.play('jump');
            
        }
        isJumping = true;
    })

    // Handle stopping the movement (when key is released)
    keyRelease(['right', 'left'], () => {
    // If the player is grounded (not jumping), switch back to the idle sprite
    if (player.grounded()) {
        player.play('idle');  // Revert to the idle sprite when stopping
        isRunning = false;
        //player.scale = vec2(1.7);  // Ensure the scale is still 1.7 for the idle sprite
    }
    });

    keyRelease(['space'], () => {
        // If the player is grounded (not jumping), switch back to the idle sprite
        if (player.grounded() && !isRunning) {
            player.play('idle');  // Revert to the idle sprite when stopping
            //player.scale = vec2(1.7);  // Ensure the scale is still 1.7 for the idle sprite
        }
    });

    });

// make the lose screen
scene('lose', ({score}) => {
    add([text('Score:  ' + score, 32), origin('center'), pos(width()/2, height()/2)]);
    add([text("\n\n\n\n Press Enter / return to restart!", 20), origin('center'), pos(width()/2, height()/2)]);
    keyDown('enter', () => {
        go ('game', 9000, 9000);
        HTMLaudio.play();
    })
});


// make the about scene
// Lay out the scene
scene("gameAbout", ({level, score}) => {
    let isOnPipe = false;
    //layers: background, object, UI, default
    layers(['bg', 'obj', 'ui'], 'obj');

    //this variable determines where the pipe should lead to (resume/education/restart... etc)
    var type = 0;

    //create map / gameBoard
    const map  = [
        "=           X         = ",
        "                        ",
        "=                     = ",
        "                        ",
        "=                     = ",
        "                        ",
        "=                     = ",
        "                        ",
        "=              -+     = ",
        "               ()       ",
        "= = = = = = = = = = = = "
    ];
    //variable to determine if mario is jumping
    var isJumping = true;
    //varible to see if mario is running
    var isRunning = false;
    //assign sprites
    const levelCfg = {
        //set height and width to 20 px each
        width: 20,
        height: 20,
        // set the = signs in the map constant to the 'block' sprite
        '=': [sprite('block'), solid(), scale(2, 2)],
        '(': [sprite('pipe-bottom-left'), solid(), 'pipe'],
        ')': [sprite('pipe-bottom-right'), solid(), 'pipe'],
        '-': [sprite('pipe-top-left'), solid(), 'pipe'],
        '+': [sprite('pipe-top-right'), solid(), 'pipe']
        //'X': [sprite('aboutBubble'), solid(), scale(0.5, 0.5), pos(-200, -100)]
    };

        const gameLevelAbout = addLevel(map, levelCfg);

        //create mario player
        const player = add ([

            //create mario image in game
            sprite('moving'),
    
            solid(), 
    
            scale(0.2, 0.2),
            //marios starting position
            pos(70,0),
    
            //causes mario to fall into position
            body(),

            //helps with glitches that might be caused from body()
            origin('bot')
        ]);

        const aboutSection = add([
            text("Hello! I'm a recent Computer Science graduate from York University, where I honed\n\n my skills in software development and artificial intelligence. My passion for \n\n technology drives me to explore innovative solutions and create impactful software. \n\nBeyond coding, I have a deep love for music, which often inspires my projects and provides\n\n a backdrop for my creative processes. When I'm not immersed in the world of programming, you\n\n can find me enjoying a round of disc golf, where I appreciate the blend of strategy and skill\n\n it requires. I'm also an avid chess player, constantly captivated by the intricacies \n\nof the game and the strategic thinking it demands.I'm excited to connect with like-minded \n\nindividuals and explore opportunities that allow me to combine my love for technology\n\n with my diverse interests.\n"),
            pos(-220, -200),
            layer('ui'),
            scale(1.2, 1.2)
        ]);

    //make the pipe available to go into
    player.collides('pipe', () =>{
        isOnPipe = true;
        keyPress('down', () =>{
            if (isOnPipe) {
                if ((!isJumping) && (type==0 || type==4)){
                    audio = new Audio("smb_pipe.wav");
                    audio.play();
                    wait(1, () =>{
                        go('game', {
                            level: 9001,
                            score: 9001
                        });
                        HTMLaudio.play();
                    })
                }
            }
        });
    });

        //if player is on ground, make isJumping = false
        player.action(() => {
            //if mario is on the ground
            if (player.grounded()){
                isJumping = false;
                if (!isRunning) {
                    player.stop();
                    player.play('idle');
                }
            }
    
            else {
                isOnPipe = false;
            }
        })
        
        // Set the camera position
        player.action(() => {
            camPos(200, 0);
            camScale(0.7, 0.7);
        });
    
        //lets assign keyboard actions to events
    //keyDown is a kaboom method
    const MOVE_SPEED = 120;
    keyDown('left', () => {
        //move(speed on x-axis, speed on y-axis)
        player.move(-MOVE_SPEED, 0);
        if (!isJumping && player.curAnim() !== "run") {
            player.play('run');
            player.anchor = vec2(0.5, 0.5); // Centered
            isRunning = true;
        }
    })
    //move right
    keyDown('right', (m) => {
        //move(speed on x-axis, speed on y-axis)
        //player.use(sprite('mario_running'), scale(5));
        player.move(MOVE_SPEED, 0);
        if (!isJumping && player.curAnim() !== "run") {
            player.play('run');
            player.anchor = vec2(0.5, 0.5); // Centered
            isRunning = true;
        }
    })
    //jumping
    let JUMP_FORCE=450;
    keyDown('space', () => {
        isOnPipe = false;
        //grounded() checked if player is on the ground
        if (player.grounded()){
            //jump(jump speed)
            audio = new Audio("smb_jump-small.wav");
            audio.play();
            player.jump(JUMP_FORCE);
            player.play('jump');
            
        }
        isJumping = true;
    })

    // Handle stopping the movement (when key is released)
    keyRelease(['right', 'left'], () => {
    // If the player is grounded (not jumping), switch back to the idle sprite
    if (player.grounded()) {
        player.play('idle');  // Revert to the idle sprite when stopping
        isRunning = false;
        //player.scale = vec2(1.7);  // Ensure the scale is still 1.7 for the idle sprite
    }
    });

    keyRelease(['space'], () => {
        // If the player is grounded (not jumping), switch back to the idle sprite
        if (player.grounded() && !isRunning) {
            player.play('idle');  // Revert to the idle sprite when stopping
            //player.scale = vec2(1.7);  // Ensure the scale is still 1.7 for the idle sprite
        }
    });
});

//start game
start ("game", ({level: 1, score: 0}));