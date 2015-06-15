"use strict";
/*content page
-Game Data
-Initializing
-Tower Objects
-Monster Objects
-Game Events
-Game Buttons
-Game Grids*/

var stage, hitsT, hit0, hit1, hit2, hit3, hit4, hit5, hit6, hit7, hit8, hit9,
output, cash, health, coordinates, time, castleData, wave, //game data
s1, s2,//monster sprites
backgroundI, background, castleI, castle, //canvas images & variable
heroI, lightTowerI, iceTowerI, //tower images
healthbarI, healthbar, marioI, warriorI, //monster images
towerData, towers, towerType, towerName, targetTower, aoeT, //tower variables
monsterData, monsters, //monster variables
checkGG, ffCount, ffCounter, errorCD, nticks=0

/*#########################################################################

                Game Data

#########################################################################*/
castleData = {"hp":100,"armor":0,"attack":10,"regen":0}
monsterData = {} //types of monsters
monsters = [] //monsters on map
towerData = {} //types of towers
towers = []   //towers currently on map
targetTower = false //selected tower on map
towerType = false //selected tower to buy
towerName = false 
aoeT = []
cash = 50;
health = 10;
wave = 1;
checkGG = 0;
ffCount = [20,40,80]
ffCounter = 1
errorCD = 0
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
var targetGrid = new createjs.Shape();
targetGrid.graphics.beginStroke("#fff").drawRect(0,0,32,32);

/*#########################################################################

                Initializing

#########################################################################*/

function init() {
    stage = new createjs.Stage("playingField");
    stage.enableMouseOver();

    imageload(); //load image into canvas
    grid(); //load grid onto map
    addTower(); //creates tower data
    addMonster(); //creates monster data
    //line of creep path
    //path();

    //add first wave of monster
    cMonster("mario",2)

    //edit UI
    document.getElementById("pauseBtn").value = "start";
    document.getElementById("castleText").innerHTML = 
    "Armor: " + castleData["armor"] + "<br>" +
    "Atk Bonus: " + castleData["attack"] + "%" +"<br>" +
    "Regen: " + castleData["regen"]

    document.getElementById("cash").innerHTML += cash;
    document.getElementById("health").innerHTML += health;
    document.getElementById("wave").innerHTML += wave; 

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

    // game test
    output = stage.addChild(new createjs.Text("", "14px monospace", "#000"));
    output.lineHeight = 15;
    output.textBaseline = "top";
    output.x = 10;
    output.y = stage.canvas.height-output.lineHeight*4-10;

    stage.update();
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

//loads required image into canvas
function imageload() {
    //background image
    backgroundI = new Image();
    backgroundI.src = "images/firstStage.png"
    //load background
    background = new createjs.Bitmap(backgroundI);
    stage.addChild(background);

    //castle image
    castleI = new Image();
    castleI.src = "images/castle64.png"
    castle = new createjs.Bitmap(castleI);
    castle.x = 320;
    castle.y = 192;
    stage.addChild(castle);

    //light tower
    lightTowerI = new Image();
    lightTowerI.src = "images/light_tower.png"

    //ice tower
    iceTowerI = new Image();
    iceTowerI.src = "images/ice_tower.png";

    //hp image
    healthbarI = new Image();
    healthbarI.src = "images/lifebar.png";

    //mario
    s1 = {
        images: ["images/mario.png"],
        frames: {width:21, height:40, count:32},
        animations: {
            right:[0,7],
            up:[8,15],
            left:[16,23],
            down:[24,31]
        }
    };
    marioI = new createjs.SpriteSheet(s1);

    //warrior
    s2 = {
        images: ["images/DarkNut.png"],
        frames: {width:24, height:31, count:16},
        animations: {
            right:[0,3],
            up:[4,7],
            left:[8,11],
            down:[12,15]
        }
    };
    warriorI = new createjs.SpriteSheet(s2);

};

/*#########################################################################

                Tower Objects

#########################################################################*/
//create tower data
function addTower() {
    //light tower
    towerData["lightTower"] =
    {"image":lightTowerI, "type":"Single",
    "range":[112,112], "cost":[10,25], "cd":[20,20], "damage":[5,10]}

    //ice tower
    towerData["iceTower"] =
    {"image":iceTowerI, "type":"Splash", "splashArea":[32], "slow":[2],
    "range":[112], "cost":[15], "cd":[20], "damage":[2]}
}


//buying tower
function buyTower(type) {
    towerType = towerData[type];
    towerName = type
    if (aoeT.length != 0) {
        toggleAoe();        
    }
    stage.removeChild(targetGrid);
    document.getElementById("infoText").innerHTML = 
    "Dmg Type: " + towerType["type"] + "<br>" +
    "Dmg: " + towerType["damage"][0] + "<br>" +
    "Range: " + towerType["range"][0]/32 + " tiles" +"<br>" +
    "Atk Spd: " + towerType["cd"][0]/20 + "APS" + "<br>" +
    "Cost: " + towerType["cost"][0] + "<br>"
};

//building tower onto canvas
function buildTower(event) {
    event.target.alpha = (event.type == "mouseover") ? .3 : 0.01;
    if (event.type == "click") {
        if (towerType) {
            if (towerType["cost"][0]<=cash) {
                $(document).ready(function() {
                    $('.tower').removeClass('selected');
                });
                event.target.mouseEnabled = false;
                var newTower = new createjs.Bitmap(towerType["image"]);
                newTower.bg = event.target
                newTower.name = towerName;
                newTower.level = 1;
                newTower.maxLevel = towerType["damage"].length;
                newTower.range = towerType["range"][0];
                newTower.maxCd = towerType["cd"][0];
                newTower.cd = 0;
                newTower.damage = towerType["damage"][0];
                newTower.bonus = 
                Math.round(castleData["attack"]/100*newTower.damage)
                newTower.cost = towerType["cost"][1];
                newTower.x = event.target.coord[0];
                newTower.y = event.target.coord[1];
                newTower.coord = event.target.coord
                newTower.on("click", handleInfo); 
                if (towerName == "iceTower") {
                    newTower.splashArea = towerType["splashArea"][0];
                    newTower.slow = towerType["slow"][0];
                }
                towers.push(newTower);
                var aoe = new createjs.Shape();
                aoe.graphics.beginStroke("#000").drawCircle(
                    newTower.x+14,newTower.y+16,newTower.range);
                aoe.alpha = .5; 
                aoeT.push(aoe)
                cash -= towerType["cost"][0];
                document.getElementById("cash").innerHTML = "Cash: " + cash;
                towerType = false;
                towerName = false;
                stage.addChild(newTower);
                toggleAoe();
            } else {
                error("Insufficient cash")
            }
        };
    };
    
    // to save CPU, we're only updating when we need to, instead of on a tick:1
    stage.update();
};

//handle tower info & upgrades
function handleInfo(event) {
    if (event.type=="click") {
        $(document).ready(function() {
            $('.tower').removeClass('selected');
        });
        towerType = false;
        towerName = false;

        targetGrid.x=event.target.coord[0];
        targetGrid.y=event.target.coord[1];
        stage.addChild(targetGrid);
        targetTower = event.target
        updateInfo(targetTower);

    }
};

//update tower info
function updateInfo(tower) {
    var nextlvl = tower.level + 1
    //tower info
    document.getElementById("infoText").innerHTML = 
    (targetTower.level < targetTower.maxLevel)?
    "Lvl: " + tower.level +" --> " + (tower.level+1) + "<br>" +
    "Dmg: " + tower.damage + " --> " + 
    towerData[tower.name]["damage"][tower.level] + "<br>" +
    "Bonus Dmg: " + tower.bonus +
    "Range: " + tower.range/32 + " --> " +  
    towerData[tower.name]["range"][tower.level]/32 + "<br>" +
    "Atk Spd: " + tower.maxCd/20 + " --> " +  
    towerData[tower.name]["cd"][tower.level]/20 + "<br>" +
    "Upgrade Cost: " + 
    towerData[tower.name]["cost"][tower.level] + "<br>" +
    "<input type='button' value='Upgrade' onclick='upgradeTower()'>" + 
    "<br>" +
    "<input type='button' value='Sell' onclick='sellTower()'>"

    : "Lvl: " + tower.level + "<br>" +
    "Dmg: " + tower.damage + "<br>" +
    "Bonus Dmg: " + tower.bonus + "<br>" +
    "Range: " + tower.range/32 +  "<br>" + 
    "Atk Spd: " + tower.maxCd/20 + "<br>" +
    "Max level"
};

//upgrading of tower
function upgradeTower() {
    if (targetTower.cost<=cash) {
        cash-=targetTower.cost
        document.getElementById("cash").innerHTML = "Cash: " + cash
        targetTower.cost = 
        towerData[targetTower.name]["cost"][targetTower.level]
        targetTower.damage = 
        towerData[targetTower.name]["damage"][targetTower.level] 
        targetTower.bonus = 
        Math.round(castleData["attack"]/100*targetTower.damage)
        targetTower.level += 1       

        updateInfo(targetTower);
    } else {
        error("Insufficient Cash!");
    }

};

function sellTower() {
    targetTower.bg.mouseEnabled = true
    cash += towerData[targetTower.name]["cost"][targetTower.level-1]
    document.getElementById("cash").innerHTML = "Cash: " + cash
    stage.removeChild(targetTower)
    towers.splice(0,1)
    document.getElementById("infoText").innerHTML = ""    
};

/*#########################################################################

                Monster Objects

#########################################################################*/
//creates monster data
function addMonster() {
    //mario
    monsterData["mario"] =
    {"image":marioI, "w": 21, "h": 40, 
    "speed":4, "hp":10, "bounty":2, "damage":1}

    //warrior
    monsterData["warrior"] =
    {"image":warriorI, "w": 24, "h": 31, 
    "speed":6, "hp":5, "bounty":2, "damage":1}
}


//add monster to canvas
function cMonster(type,amt) {
    for (var i=0; i<amt; i++) {
        var mtype = monsterData[type]
        //hp appear above monster
        healthbar = new createjs.Bitmap(healthbarI)
        healthbar.sourceRect = new createjs.Rectangle(0,0,mtype["w"],3);
        healthbar.y = -5
        var m1 = new createjs.Sprite(mtype["image"])
        //add properties to monster
        var newMonster = new createjs.Container()
        newMonster.addChild(healthbar, m1)
        newMonster.pos = [0,0,1,0]
        newMonster.w = mtype["w"]
        newMonster.h = mtype["h"] 
        newMonster.x = 96 - newMonster.w/2
        newMonster.y = - newMonster.h - i*newMonster.h*1.5
        newMonster.dmg = mtype["damage"]
        newMonster.speed = mtype["speed"]
        newMonster.currentHp = mtype["hp"]
        newMonster.maxHp = mtype["hp"]
        newMonster.bounty = mtype["bounty"]
        newMonster.dead = 0
        //add monster to array
        monsters.push(newMonster)
        stage.addChild(newMonster)
    }
    stage.addChild(castle)
}

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

/*#########################################################################

                Game Events

#########################################################################*/

//ticker events
function tick(event) {
    errorTextcd();

    if (!createjs.Ticker.getPaused()) {
        nticks++

        towerAttacks();//check for tower attack
        monsterMovement();//controls monster movement


        if (health==0) {
            checkGG++;
            if (checkGG==1) {
                isOver();
                checkGG++;
            }
        }
    };
    
    //testings

    time = Math.round(createjs.Ticker.getTime(true)/100)/10
    output.text = "Paused = "+createjs.Ticker.getPaused()+"\n"+
        "Time = "+ time + "\n" +
        towerType + towerName

    stage.update(event); // important!!
};

function errorTextcd() {
    if (errorCD) {
        if (errorCD==1) {
            document.getElementById("errorText").innerHTML = ""
        }
        errorCD--;
    }    
}

//monster path
function monsterMovement() {
    for (var i=0;i<monsters.length;i++) {
        var mob = monsters[i]
        //line 1
        if (mob.y<=coordinates[1][1]-mob.h/2 &&
            mob.x<=coordinates[1][0]) {
            mob.y+=mob.speed;
            if (mob.pos[2]==1) {
                cAnimation();
                mob.pos[2]++;
            }
        }
        //line 2
        else if (mob.x<=coordinates[2][0]-mob.w/2 &&
            mob.y>=coordinates[2][1]-mob.h/2) {
            mob.x+=mob.speed;
            if (mob.pos[1]==0) {
                mob.pos=[0,1,0,0];
            }
            else if (mob.pos[1]==1) {
                cAnimation();
                mob.pos[1]++;
            }
        }
        //line 3
        else if (mob.y>=coordinates[3][1]-mob.h/2 &&
            mob.x>=coordinates[3][0]-mob.w/2) {
            mob.y-=mob.speed;
            if (mob.pos[0]==0) {
                mob.pos=[1,0,0,0];
            }
            else if (mob.pos[0]==1) {
                cAnimation();
                mob.pos[0]++;
            }
        }
        //line 4
        else if (mob.x>=coordinates[4][0]-mob.w/2 &&
            mob.y<=coordinates[4][1]-mob.h/2) {
            mob.x-=mob.speed;
            if (mob.pos[3]==0) {
                mob.pos=[0,0,0,1];
            }
            else if (mob.pos[3]==1) {
                cAnimation();
                mob.pos[3]++;
            }
        }
        //line 5
        else if (mob.y<=coordinates[5][1]-mob.h/2 &&
            mob.x<=coordinates[5][0]-mob.w/2) {
            mob.y+=mob.speed;
            if (mob.pos[2]==0) {
                mob.pos=[0,0,1,0];
            }
            else if (mob.pos[2]==1) {
                cAnimation();
                mob.pos[2]++;
            }
        }
        //line 6
        else if (mob.x<=coordinates[6][0]-mob.w/2 &&
            mob.y>=coordinates[6][1]-mob.h/2) {
            mob.x+=mob.speed;
            if (mob.pos[1]==0) {
                mob.pos=[0,1,0,0];
            }
            else if (mob.pos[1]==1) {
                cAnimation();
                mob.pos[1]++;
            }
        }
        //line 7
        else if (mob.y>=coordinates[7][1]-mob.h/2) {
            mob.y-=mob.speed;
            if (mob.pos[0]==0) {
                mob.pos=[1,0,0,0];
            }
            else if (mob.pos[0]==1) {
                cAnimation();
                mob.pos[0]++;
            }
        }
        //line 8
        else if (mob.x>=coordinates[8][0]-mob.w) {
            mob.x-=mob.speed;
            if (mob.pos[3]==0) {
                mob.pos=[0,0,0,1];
            }
            else if (mob.pos[3]==1) {
                cAnimation();
                mob.pos[3]++;
            }
        }
        //monster attacks
        else { 
            if (!mob.dead) {
                health-=mob.dmg-castleData["armor"];
                document.getElementById("health").innerHTML ="Health: " + health;
                mob.dead++;
                stage.removeChild(mob);
                monsters.splice(i,1);

            }
        }
    }
}

//tower attacking
function towerAttacks() {
    if (towers) {
        for (var i=0;i<towers.length;i++) {
            if (towers[i].cd>0) {
                towers[i].cd--;
                continue;
            };
            for (var j=0;j<monsters.length;j++) {
                if (inRange(towers[i],monsters[j]) && monsters[j].y>=0) {
                    monsters[j].currentHp-=towers[i].damage + towers[i].bonus;
                    monsters[j].getChildAt(0).sourceRect = 
                    new createjs.Rectangle(0,0,monsters[j]
                        .currentHp/monsters[j].maxHp*monsters[j].w,3);
                    towers[i].cd=towers[i].maxCd;

                    //remove monster from map
                    if (monsters[j].currentHp<=0) {
                        stage.removeChild(monsters[j]);
                        cash+=monsters[j].bounty;
                        monsters.splice(j,1);
                        document.getElementById("cash").innerHTML="cash: "+
                        cash;
                    }
                    break;
                }
            }
        }
    }
}


/*#########################################################################

                Game Buttons

#########################################################################*/
//error text
function error(txt) {
    document.getElementById("errorText").innerHTML = txt;
    errorCD = 30;
}

//toggle aoe
function toggleAoe() {
    if (aoeT.length == 0) {
        towerName = false;
        $(document).ready(function() {
            $('.tower').removeClass('selected');
        });        
    }
    for (var i=0;i<aoeT.length;i++) {
        if (towerType) {
            stage.addChild(aoeT[i]);
        } else {
            towerName = false;
            $(document).ready(function() {
                $('.tower').removeClass('selected');
            });
            stage.removeChild(aoeT[i]);
        }
    }
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
        document.getElementById("wave").innerHTML = "Wave: " + wave;
        if (wave%10==0) {
        }
        if (wave%2!=0) {
            monsterData["mario"]["hp"]+=1
            cMonster("mario",2);
        } else {
            monsterData["warrior"]["hp"]+=1
            cMonster("warrior",2);
        }
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
    } else {
        togglePause();
    }
}

/*#########################################################################

                Game Grids

#########################################################################*/

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
            hitsT[0][i][j].on("mouseover", buildTower);
            hitsT[0][i][j].on("mouseout", buildTower);
            hitsT[0][i][j].on("click", buildTower); 
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
            hitsT[1][i][j].on("mouseover", buildTower);
            hitsT[1][i][j].on("mouseout", buildTower);
            hitsT[1][i][j].on("click", buildTower); 
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
            hitsT[2][i][j].on("mouseover", buildTower);
            hitsT[2][i][j].on("mouseout", buildTower);
            hitsT[2][i][j].on("click", buildTower); 
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
            hitsT[3][i][j].on("mouseover", buildTower);
            hitsT[3][i][j].on("mouseout", buildTower);
            hitsT[3][i][j].on("click", buildTower); 
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
            hitsT[4][i][j].on("mouseover", buildTower);
            hitsT[4][i][j].on("mouseout", buildTower);
            hitsT[4][i][j].on("click", buildTower); 
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
            hitsT[5][i][j].on("mouseover", buildTower);
            hitsT[5][i][j].on("mouseout", buildTower);
            hitsT[5][i][j].on("click", buildTower); 
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
            hitsT[6][i][j].on("mouseover", buildTower);
            hitsT[6][i][j].on("mouseout", buildTower);
            hitsT[6][i][j].on("click", buildTower); 
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
            hitsT[7][i][j].on("mouseover", buildTower);
            hitsT[7][i][j].on("mouseout", buildTower);
            hitsT[7][i][j].on("click", buildTower); 
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
            hitsT[8][i][j].on("mouseover", buildTower);
            hitsT[8][i][j].on("mouseout", buildTower);
            hitsT[8][i][j].on("click", buildTower); 
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
            hitsT[9][i][j].on("mouseover", buildTower);
            hitsT[9][i][j].on("mouseout", buildTower);
            hitsT[9][i][j].on("click", buildTower); 
            stage.addChild(hitsT[9][i][j]);
        };
    };
};



