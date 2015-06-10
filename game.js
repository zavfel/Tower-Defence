"use strict";

var stage, hitsT, hit0, hit1, hit2, hit3, hit4, hit5, hit6, hit7, hit8, hit9,
output, cash, life, coordinates, time,
backgroundI, castleI, heroI, healthbarI, marioI, mario, warrior, warriorI,
background, castle,
towers, towerCost, towerI, towerR, towerCd, towerDamage, towerSelection, aoeT,
monsters, monstersAmt, newMonster, monsterstats, monsterI,
healthbar,
wave, checkGG, ffCount, ffCounter,nticks=0

//game stats
monsterstats = [[10,4,2],[15,6,2]] //hp,speed,cash,amt
monsters = [] //monsters on map
monsterI = [] //types of monster available 
towers = []   //towers on map
towerI = []   //types of tower available
towerCost = []
towerR = []
towerCd = []
towerDamage = []
towerSelection = false
aoeT = []
cash = 60;
life = 10;
wave = 1;
checkGG = 0;
ffCount = [20,40,80]
ffCounter = 1
coordinates = [
[96, 0],
[96, 480],
[800, 480],
[800, 96],
[224, 96],
[224, 352],
[672, 352],
[672, 224],
[384, 224]
];

//initialized
function init() {
    stage = new createjs.Stage("demoCanvas");
    stage.enableMouseOver();

    imageurl();//direct image src
    grid();//grid of map
    //path();//line of creep path

    //editing non canvas buttons
    document.getElementById("pauseBtn").value = "start";
    document.getElementById("cash").value = cash;
    document.getElementById("life").value = life;
    document.getElementById("wave").value = wave; 

    /*var test = new createjs.Bitmap(canonI)
    test.x=48
    test.y=48
    test.regY = 16;
    test.regX = 16;
    test.rotation = ;
    stage.addChild(test)*/

    // creates ticks
    createjs.Ticker.on("tick", tick);
    createjs.Ticker.setPaused(true);
    createjs.Ticker.setFPS(20);

    // UI code:
    output = stage.addChild(new createjs.Text("", "14px monospace", "#000"));
    output.lineHeight = 15;
    output.textBaseline = "top";
    output.x = 10;
    output.y = stage.canvas.height-output.lineHeight*4-10;
};


function path() {
    //show on map the path of creep
    var line = new createjs.Shape();

    for (var i=1;i<coordinates.length;i++) {
        var point1=coordinates[i-1];
        var point2=coordinates[i];
    //start drawing 
    line.graphics.setStrokeStyle(1).beginStroke("#000")
    .moveTo(point1[0],point1[1])
    .lineTo(point2[0],point2[1]);
    stage.addChild(line);
    };
}

function imageurl() {
    //background image
    backgroundI = new Image();
    backgroundI.src = "images/firstStage.png"
    //load background
    background = new createjs.Bitmap(backgroundI);
    stage.addChild(background);

    //castle image
    castleI = new Image();
    castleI.src = "images/castle64.png"
    castleI.onload = handleImageLoad;

    //tower-hero image
    heroI = new Image();
    heroI.src = "images/hero.png";
    towerI.push(heroI);
    towerR.push(112);
    towerCd.push(19);//1APS
    towerDamage.push(5);
    towerCost.push(10);


    //hp image
    healthbarI = new Image();
    healthbarI.src = "images/lifebar.png";

    //creep-mario
    mario = {
        images: ["images/mario.png"],
        frames: {width:21, height:40, count:32},
        animations: {
            right:[0,7],
            up:[8,15],
            left:[16,23],
            down:[24,31]
        }
    };
    marioI = new createjs.SpriteSheet(mario);
    monsterI.push(marioI)

    //creep-mario
    warrior = {
        images: ["images/DarkNut.png"],
        frames: {width:24, height:31, count:16},
        animations: {
            right:[0,3],
            up:[4,7],
            left:[8,11],
            down:[12,15]
        }
    };
    warriorI = new createjs.SpriteSheet(warrior);
    monsterI.push(warriorI)
};

//handle image load
function handleImageLoad(event) {
    //load castle
    castle = new createjs.Bitmap(castleI);
    castle.x = 320;
    castle.y = 192;

    cMonster(monsterstats[0],2,0);

    //add to stage
    stage.addChild(castle);
    stage.update();
};

//buying tower
function buyTower(index) {
    towerSelection = [towerI[index],towerR[index],
    towerCd[index],towerDamage[index],towerCost[index]];
    toggleAoe();
};

//hit area
function handleMouse(event) {
    event.target.alpha = (event.type == "mouseover") ? .3 : 0.01;
    if (event.type == "click") {
        if (towerSelection && towerSelection[4]<=cash) {
            var newTower = new createjs.Bitmap(towerSelection[0]);
            newTower.range = towerSelection[1];
            newTower.maxCd = towerSelection[2]
            newTower.cd = 0
            newTower.damage = towerSelection[3]
            newTower.x = event.target.coord[0];
            newTower.y = event.target.coord[1];
            newTower.on("click", handleTower); 
            towers.push(newTower);
            var aoe = new createjs.Shape();
            aoe.graphics.beginStroke("#000").drawCircle(
                newTower.x+14,newTower.y+16,newTower.range);
            aoe.alpha = .5; 
            aoeT.push(aoe)
            cash-=towerSelection[4];
            document.getElementById("cash").value=cash;
            towerSelection = false;
            stage.addChild(newTower);
            toggleAoe();
        };
    };
    
    // to save CPU, we're only updating when we need to, instead of on a tick:1
    stage.update();
};

//handle tower upgrades
function handleTower(event) {
    if (event.type=="click") {

    }
}

//create monsters
function cMonster(stats,amt,type) {//hp,speed,cash
    for (var i=0; i<amt; i++) {
        healthbar = new createjs.Bitmap(healthbarI);
        healthbar.y= -5;
        var m1 = new createjs.Sprite(monsterI[type])
        //createjs.Bitmap(monsterI);
        newMonster = new createjs.Container();
        newMonster.addChild(healthbar, m1);
        newMonster.pos = [0,0,1,0]
        newMonster.x = 85;
        newMonster.y = -40 - i*64;
        newMonster.speed = stats[1];
        newMonster.currentHp = stats[0];
        newMonster.maxHp = stats[0];
        newMonster.cash = stats[2];
        newMonster.dead = 0;
        monsters.push(newMonster);
        stage.addChild(newMonster);
    }
}



//check range
function inRange(tower,mon) {
    var dx=Math.abs(tower.x+16-mon.x);
    var dy=Math.abs(tower.y+16-mon.y);
    var dist=Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2));
    if (dist<=tower.range) {
        return true
    }
    else {
        return false
    }
};

//check animation direction
function cAnimation() {
    for (var i=0;i<monsters.length;i++) {
        for (var j=0;j<4;j++) {
            var checkPos = monsters[i].pos[j]
            //up
            if (j==0) {
                if (checkPos==1) {
                    monsters[i].getChildAt(1).gotoAndPlay("up")
                };
            }
            else if (j==1) {
                if (checkPos==1) {
                    monsters[i].getChildAt(1).gotoAndPlay("right")
                };
            }
            else if (j==2) {
                if (checkPos==1) {
                    monsters[i].getChildAt(1).gotoAndPlay("down")
                };
            }
            else if (j==3) {
                if (checkPos==1) {
                    monsters[i].getChildAt(1).gotoAndPlay("left")
                };
            }
        }    
    }
}


//ticker events
function tick(event) {
    time = Math.round(createjs.Ticker.getTime(true)/100)/10

    if (!createjs.Ticker.getPaused()) {
        nticks++
        if (towers.length!=0) {
            for (var i=0;i<towers.length;i++) {
                if (towers[i].cd>0) {
                    towers[i].cd--;
                    continue;
                };

                for (var j=0;j<monsters.length;j++) {
                    if (inRange(towers[i],monsters[j]) && monsters[j].y>=0) {
                        monsters[j].currentHp-=towers[i].damage;
                        monsters[j].getChildAt(0).sourceRect = 
                        new createjs.Rectangle(0,0,monsters[j].currentHp/monsters[j]
                            .maxHp*32,3);
                        towers[i].cd=towers[i].maxCd;

                        //remove monster from map
                        if (monsters[j].currentHp<=0) {
                            stage.removeChild(monsters[j]);
                            cash+=monsters[j].cash;
                            monsters.splice(j,1);
                            document.getElementById("cash").value=cash;
                        }
                    }
                }
            }
        }

        //creep path
        for (var i=0;i<monsters.length;i++) {
            if (monsters[i].y<=coordinates[1][1]-16 &&
                monsters[i].x<=coordinates[1][0]) {
                monsters[i].y+=monsters[i].speed;
                if (monsters[i].pos[2]==1) {
                    cAnimation();
                    monsters[i].pos[2]++;
                }
            }
            else if (monsters[i].x<=coordinates[2][0]-16 &&
                monsters[i].y>=coordinates[2][1]-16) {
                monsters[i].x+=monsters[i].speed;
                if (monsters[i].pos[1]==0) {
                    monsters[i].pos=[0,1,0,0];
                }
                else if (monsters[i].pos[1]==1) {
                    cAnimation();
                    monsters[i].pos[1]++;
                }
            }
            else if (monsters[i].y>=coordinates[3][1]-16 &&
                monsters[i].x>=coordinates[3][0]-16) {
                monsters[i].y-=monsters[i].speed;
                if (monsters[i].pos[0]==0) {
                    monsters[i].pos=[1,0,0,0];
                }
                else if (monsters[i].pos[0]==1) {
                    cAnimation();
                    monsters[i].pos[0]++;
                }
            }
            else if (monsters[i].x>=coordinates[4][0]-16 &&
                monsters[i].y<=coordinates[4][1]-16) {
                monsters[i].x-=monsters[i].speed;
                if (monsters[i].pos[3]==0) {
                    monsters[i].pos=[0,0,0,1];
                }
                else if (monsters[i].pos[3]==1) {
                    cAnimation();
                    monsters[i].pos[3]++;
                }
            }
            else if (monsters[i].y<=coordinates[5][1]-16 &&
                monsters[i].x<=coordinates[5][0]-16) {
                monsters[i].y+=monsters[i].speed;
                if (monsters[i].pos[2]==0) {
                    monsters[i].pos=[0,0,1,0];
                }
                else if (monsters[i].pos[2]==1) {
                    cAnimation();
                    monsters[i].pos[2]++;
                }
            }
            else if (monsters[i].x<=coordinates[6][0]-16 &&
                monsters[i].y>=coordinates[6][1]-16) {
                monsters[i].x+=monsters[i].speed;
                if (monsters[i].pos[1]==0) {
                    monsters[i].pos=[0,1,0,0];
                }
                else if (monsters[i].pos[1]==1) {
                    cAnimation();
                    monsters[i].pos[1]++;
                }
            }
            else if (monsters[i].y>=coordinates[7][1]-16) {
                monsters[i].y-=monsters[i].speed;
                if (monsters[i].pos[0]==0) {
                    monsters[i].pos=[1,0,0,0];
                }
                else if (monsters[i].pos[0]==1) {
                    cAnimation();
                    monsters[i].pos[0]++;
                }
            }
            else if (monsters[i].x>=coordinates[8][0]-32) {
                monsters[i].x-=monsters[i].speed;
                if (monsters[i].pos[3]==0) {
                    monsters[i].pos=[0,0,0,1];
                }
                else if (monsters[i].pos[3]==1) {
                    cAnimation();
                    monsters[i].pos[3]++;
                }
            }
            else if (monsters[i].x<=352) {
                if (!monsters[i].dead) {
                    life-=1;
                    document.getElementById("life").value = life;
                    monsters[i].dead++;
                    stage.removeChild(monsters[i]);
                    monsters.splice(i,1);

                }
            }
        };

        //lose life 
        for (var i=0;i<monsters.length;i++) {
            if (monsters[i].x==360 &&
                monsters[i].y==204) {
                monsters.splice(i,1);
                stage.removeChild(monsters[i]);
                life-=1;
                document.getElementById("life").value = life;
            };
        };

        if (life==0) {
            checkGG++;
            if (checkGG==1) {
                isOver();
                checkGG++;
            }
        }
    };
    

    output.text = "Paused = "+createjs.Ticker.getPaused()+"\n"+
        "Time = "+ time +"ticks"+ nticks +"\n" +
        monsters
    
    stage.update(event); // important!!
};

//toggle aoe
function toggleAoe() {
    for (var i=0;i<aoeT.length;i++) {
        if (towerSelection) {
            stage.addChild(aoeT[i]);
        } else {
            stage.removeChild(aoeT[i]);
        }
    }
    stage.update();
}

// fast forward
function ff() {
    createjs.Ticker.setFPS(ffCount[ffCounter]);
    switch(ffCounter) {
        case 1:
            ffCounter++;
            document.getElementById("ffBtn").value="2x";
            break;
        case 2:
            ffCounter=0;
            document.getElementById("ffBtn").value="4x";
            break;
        case 0:
            ffCounter++;
            document.getElementById("ffBtn").value="1x";
            break;
    }
}

//next wave
function nextWave() {
    if (!createjs.Ticker.getPaused()) {
        wave++;
        document.getElementById("wave").value = wave;
        if (wave%10==0) {
           monsterstats[0][2] += 1 
        }
        if (wave%2!=0) {
            monsterstats[0][0] *= 1.2
            cMonster(monsterstats[0],2,0);
        } else {
            cMonster(monsterstats[1],2,1);

        }
        stage.removeChild(castle);//making sure castle stays on the top layer
        stage.addChild(castle);
    }
}

//toggle pause
function togglePause() {
    var paused = createjs.Ticker.getPaused();
    createjs.Ticker.setPaused(!paused);
    document.getElementById("pauseBtn").value = !paused ? "play" : "pause";
    for (var i=0;i<monsters.length;i++) {
        for (var j=0;j<4;j++) {
            if (!paused) {
                if (monsters[i].pos[j]==2) {
                    monsters[i].pos[j]=1;
                    switch (j) {
                        case 0:
                            monsters[i].getChildAt(1).gotoAndStop("up");
                            break;
                        case 1:
                            monsters[i].getChildAt(1).gotoAndStop("right");
                            break;
                        case 2:
                            monsters[i].getChildAt(1).gotoAndStop("down");
                            break;
                        case 3:
                            monsters[i].getChildAt(1).gotoAndStop("left");
                            break;                            

                    }
                }
            } else {
                cAnimation();
            }
        }
    }

};

//restart
function restart() {
    document.location.reload();
}

//game over
function isOver() {
    if (confirm("Game Over!!"+"\n"+"Do you want to restart?") == true) {
        restart();
    }
}

//###############################################################################
//###############################################################################
//###############################################################################
//###############################################################################
//###############################################################################
//###############################################################################
//###############################################################################
//###############################################################################
//###############################################################################

//grid
function grid() {
    //hitarea of map
    hitsT=[]
    //left area
    hitsT[0] = []
    hit0=[2, stage.canvas.height/32]

    for (var i=0;i<hit0[0];i++) {
        hitsT[0][i] = [];
    };

    for (var i=0;i<hit0[0];i++) {
        for (var j=0;j<hit0[1];j++) {
            hitsT[0][i][j] = new createjs.Shape();
            hitsT[0][i][j].graphics.beginFill("#f00").drawRect(32*i,32*j,32,32);
            hitsT[0][i][j].alpha=0.01;
            hitsT[0][i][j].coord=[32*i,32*j]
            hitsT[0][i][j].on("mouseover", handleMouse);
            hitsT[0][i][j].on("mouseout", handleMouse);
            hitsT[0][i][j].on("click", handleMouse); 
            stage.addChild(hitsT[0][i][j]);
        };
    };
    //bottom area
    hitsT[1] = []
    hit1=[(stage.canvas.width/32)-4,1]

    for (var i=0;i<hit1[0];i++) {
        hitsT[1][i] = [];
    };

    for (var i=0;i<hit1[0];i++) {
        for (var j=0;j<hit1[1];j++) {
            hitsT[1][i][j] = new createjs.Shape();
            hitsT[1][i][j].graphics.beginFill("#f00").drawRect(64+32*i,
                (stage.canvas.height-32),32,32);
            hitsT[1][i][j].alpha=0.01;
            hitsT[1][i][j].coord=[64+32*i,stage.canvas.height-32];
            hitsT[1][i][j].on("mouseover", handleMouse);
            hitsT[1][i][j].on("mouseout", handleMouse);
            hitsT[1][i][j].on("click", handleMouse); 
            stage.addChild(hitsT[1][i][j]);
        };
    };
    //top area
    hitsT[2] = []
    hit2=[(stage.canvas.width/32)-6,2]

    for (var i=0;i<hit2[0];i++) {
        hitsT[2][i] = [];
    };

    for (var i=0;i<hit2[0];i++) {
        for (var j=0;j<hit2[1];j++) {
            hitsT[2][i][j] = new createjs.Shape();
            hitsT[2][i][j].graphics.beginFill("#f00").drawRect(128+32*i,
                32*j,32,32);
            hitsT[2][i][j].alpha=0.01;
            hitsT[2][i][j].coord=[128+32*i,32*j];
            hitsT[2][i][j].on("mouseover", handleMouse);
            hitsT[2][i][j].on("mouseout", handleMouse);
            hitsT[2][i][j].on("click", handleMouse); 
            stage.addChild(hitsT[2][i][j]);
        };
    };
    //left inner area
    hitsT[3] = []
    hit3=[2,12]

    for (var i=0;i<hit3[0];i++) {
        hitsT[3][i] = [];
    };

    for (var i=0;i<hit3[0];i++) {
        for (var j=0;j<hit3[1];j++) {
            hitsT[3][i][j] = new createjs.Shape();
            hitsT[3][i][j].graphics.beginFill("#f00").drawRect(128+32*i,
                64+32*j,32,32);
            hitsT[3][i][j].alpha=0.01;
            hitsT[3][i][j].coord=[128+32*i,64+32*j];
            hitsT[3][i][j].on("mouseover", handleMouse);
            hitsT[3][i][j].on("mouseout", handleMouse);
            hitsT[3][i][j].on("click", handleMouse); 
            stage.addChild(hitsT[3][i][j]);
        };
    };       
    //bottom inner area
    hitsT[4] = []
    hit4=[16,2]

    for (var i=0;i<hit4[0];i++) {
        hitsT[4][i] = [];
    };

    for (var i=0;i<hit4[0];i++) {
        for (var j=0;j<hit4[1];j++) {
            hitsT[4][i][j] = new createjs.Shape();
            hitsT[4][i][j].graphics.beginFill("#f00").drawRect(192+32*i,
                stage.canvas.height-160+32*j,32,32);
            hitsT[4][i][j].alpha=0.01;
            hitsT[4][i][j].coord=[192+32*i,stage.canvas.height-160+32*j];
            hitsT[4][i][j].on("mouseover", handleMouse);
            hitsT[4][i][j].on("mouseout", handleMouse);
            hitsT[4][i][j].on("click", handleMouse); 
            stage.addChild(hitsT[4][i][j]);
        };
    };
    //top inner area
    hitsT[5] = []
    hit5=[14,2]

    for (var i=0;i<hit5[0];i++) {
        hitsT[5][i] = [];
    };

    for (var i=0;i<hit5[0];i++) {
        for (var j=0;j<hit5[1];j++) {
            hitsT[5][i][j] = new createjs.Shape();
            hitsT[5][i][j].graphics.beginFill("#f00").drawRect(256+32*i,
                128+32*j,32,32);
            hitsT[5][i][j].alpha=0.01;
            hitsT[5][i][j].coord=[256+32*i,128+32*j];
            hitsT[5][i][j].on("mouseover", handleMouse);
            hitsT[5][i][j].on("mouseout", handleMouse);
            hitsT[5][i][j].on("click", handleMouse); 
            stage.addChild(hitsT[5][i][j]);
        };
    };
    //bot inner-most area
    hitsT[6] = []
    hit6=[12,2]

    for (var i=0;i<hit6[0];i++) {
        hitsT[6][i] = [];
    };

    for (var i=0;i<hit6[0];i++) {
        for (var j=0;j<hit6[1];j++) {
            hitsT[6][i][j] = new createjs.Shape();
            hitsT[6][i][j].graphics.beginFill("#f00").drawRect(256+32*i,
                256+32*j,32,32);
            hitsT[6][i][j].alpha=0.01;
            hitsT[6][i][j].coord=[256+32*i,256+32*j];
            hitsT[6][i][j].on("mouseover", handleMouse);
            hitsT[6][i][j].on("mouseout", handleMouse);
            hitsT[6][i][j].on("click", handleMouse); 
            stage.addChild(hitsT[6][i][j]);
        };
    };
    //left inner-most area
    hitsT[7] = []
    hit7=[2,2]

    for (var i=0;i<hit7[0];i++) {
        hitsT[7][i] = [];
    };

    for (var i=0;i<hit7[0];i++) {
        for (var j=0;j<hit7[1];j++) {
            hitsT[7][i][j] = new createjs.Shape();
            hitsT[7][i][j].graphics.beginFill("#f00").drawRect(256+32*i,
                192+32*j,32,32);
            hitsT[7][i][j].alpha=0.01;
            hitsT[7][i][j].coord=[256+32*i,192+32*j];
            hitsT[7][i][j].on("mouseover", handleMouse);
            hitsT[7][i][j].on("mouseout", handleMouse);
            hitsT[7][i][j].on("click", handleMouse); 
            stage.addChild(hitsT[7][i][j]);
        };
    };
    //right inner area
    hitsT[8] = []
    hit8=[2,10]

    for (var i=0;i<hit8[0];i++) {
        hitsT[8][i] = [];
    };

    for (var i=0;i<hit8[0];i++) {
        for (var j=0;j<hit8[1];j++) {
            hitsT[8][i][j] = new createjs.Shape();
            hitsT[8][i][j].graphics.beginFill("#f00").drawRect(704+32*i,
                128+32*j,32,32);
            hitsT[8][i][j].alpha=0.01;
            hitsT[8][i][j].coord=[704+32*i,128+32*j];
            hitsT[8][i][j].on("mouseover", handleMouse);
            hitsT[8][i][j].on("mouseout", handleMouse);
            hitsT[8][i][j].on("click", handleMouse); 
            stage.addChild(hitsT[8][i][j]);
        };
    };
    //right area
    hitsT[9] = []
    hit9=[2,17]

    for (var i=0;i<hit9[0];i++) {
        hitsT[9][i] = [];
    };

    for (var i=0;i<hit9[0];i++) {
        for (var j=0;j<hit9[1];j++) {
            hitsT[9][i][j] = new createjs.Shape();
            hitsT[9][i][j].graphics.beginFill("#f00").drawRect(832+32*i,
                32*j,32,32);
            hitsT[9][i][j].alpha=0.01;
            hitsT[9][i][j].coord=[704+32*i,128+32*j];
            hitsT[9][i][j].on("mouseover", handleMouse);
            hitsT[9][i][j].on("mouseout", handleMouse);
            hitsT[9][i][j].on("click", handleMouse); 
            stage.addChild(hitsT[9][i][j]);
        };
    };
};



