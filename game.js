"use strict";

var stage, hitsT, hit0, hit1, hit2, hit3, hit4, hit5, hit6, hit7, hit8, hit9,
output, cash, life, coordinates, time,
backgroundI, castleI, heroI, healthbarI, marioI, mario, warrior, warriorI,
background, castle,
towerI, towerCost, towerR, towerCd, towerDamage, towers, 
towerSelection, aoeT, targetTower, tInfo,
monsters, monstersAmt, newMonster, monsterstats, 
monsterI,
healthbar,
wave, checkGG, ffCount, ffCounter, errorCD, nticks=0

//game stats
monsterstats = [[10,4,2],[15,6,2]] //hp,speed,cash,amt
monsters = [] //monsters on map
monsterI = [] //types of monster available
targetTower = false 
towers = []   //towers on map
towerI = []   //types of tower available
towerCost = []
towerR = []
towerCd = []
towerDamage = []
towerSelection = false
aoeT = []
cash = 20;
life = 10;
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

//initialized
function init() {
    stage = new createjs.Stage("demoCanvas");
    stage.enableMouseOver();

    imageurl();//direct image src
    grid();//grid of map
    //path();//line of creep path

    //editing non canvas buttons
    document.getElementById("pauseBtn").value = "start";
    document.getElementById("cash").innerHTML += cash;
    document.getElementById("life").innerHTML += life;
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
    stage.removeChild(targetGrid);
    document.getElementById("infoText").innerHTML = ""
};

//hit area
function handleTower(event) {
    event.target.alpha = (event.type == "mouseover") ? .3 : 0.01;
    if (event.type == "click") {
        if (towerSelection) {
            if (towerSelection[4]<=cash) {
                var newTower = new createjs.Bitmap(towerSelection[0]);
                newTower.level = 1;
                newTower.range = towerSelection[1];
                newTower.maxCd = towerSelection[2];
                newTower.cd = 0;
                newTower.damage = towerSelection[3];
                newTower.upgradeCost = [25];
                newTower.x = event.target.coord[0];
                newTower.y = event.target.coord[1];
                newTower.coord = event.target.coord
                newTower.on("click", handleInfo); 
                towers.push(newTower);
                var aoe = new createjs.Shape();
                aoe.graphics.beginStroke("#000").drawCircle(
                    newTower.x+14,newTower.y+16,newTower.range);
                aoe.alpha = .5; 
                aoeT.push(aoe)
                cash-=towerSelection[4];
                document.getElementById("cash").innerHTML = "cash: " +cash;
                towerSelection = false;
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

//handle tower upgrades
function handleInfo(event) {
    if (event.type=="click") {
        targetGrid.x=event.target.coord[0];
        targetGrid.y=event.target.coord[1];
        stage.addChild(targetGrid);
        targetTower = event.target
        updateInfo(targetTower);

    }
}

//upgrade tower stats
function upgradeT() {
    var cost = targetTower.upgradeCost[targetTower.level-1]
    if (cost<=cash) {
        cash-=cost
        document.getElementById("cash").innerHTML = "cash: " + cash
        targetTower.level+=1
        targetTower.damage+=5
        updateInfo(targetTower);
    } else {
        error("Insufficient Cash!");
    }

}

//update tower info
function updateInfo(tower) {
    var nextlvl = [tower.level+1,tower.damage+5]
    //tower info
    document.getElementById("infoText").innerHTML = 
    (tower.upgradeCost[tower.level-1])?
    "Lvl: " + tower.level +"-->" + nextlvl[0] + "<br>" +
    "Dmg: " + tower.damage + "-->" + nextlvl[1] + "<br>" +
    "Range: " + tower.range/32 +  "<br>" +
    "Upgrade Cost: " +
    tower.upgradeCost[tower.level-1] + "<br>" +
    "<input type='button' value='upgrade' onclick='upgradeT()'>"
    : "Lvl: " + tower.level + "<br>" +
    "Dmg: " + tower.damage + "<br>" +
    "Range: " + tower.range/32 +  "<br>" + 
    "Max lvl"
}

//create monsters
function cMonster(stats,amt,type) {//hp,speed,cash
    for (var i=0; i<amt; i++) {
        var mBounds = monsterI[type].getFrameBounds(0)
        healthbar = new createjs.Bitmap(healthbarI)
        healthbar.sourceRect = new createjs.Rectangle(0,0,mBounds.width,3);
        healthbar.y= -5
        var m1 = new createjs.Sprite(monsterI[type])
        //createjs.Bitmap(monsterI);
        newMonster = new createjs.Container()
        newMonster.addChild(healthbar, m1)
        newMonster.pos = [0,0,1,0]
        newMonster.area = mBounds 
        newMonster.x = 96 - mBounds.width/2
        newMonster.y = -mBounds.height - i*mBounds.height*1.5
        newMonster.speed = stats[1]
        newMonster.currentHp = stats[0]
        newMonster.maxHp = stats[0]
        newMonster.cash = stats[2]
        newMonster.dead = 0
        monsters.push(newMonster)
        stage.addChild(newMonster)
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
    if (errorCD) {
        if (errorCD==1) {
            document.getElementById("errorText").innerHTML = ""
        }
        errorCD--;
    }

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
                        new createjs.Rectangle(0,0,monsters[j]
                            .currentHp/monsters[j].maxHp*monsters[j].area.width,3);
                        towers[i].cd=towers[i].maxCd;

                        //remove monster from map
                        if (monsters[j].currentHp<=0) {
                            stage.removeChild(monsters[j]);
                            cash+=monsters[j].cash;
                            monsters.splice(j,1);
                            document.getElementById("cash").innerHTML="cash: "+
                            cash;
                        }
                        break;
                    }
                }
            }
        }

        //creep path
        for (var i=0;i<monsters.length;i++) {
            var mob = monsters[i]
            //line 1
            if (mob.y<=coordinates[1][1]-mob.area.height/2 &&
                mob.x<=coordinates[1][0]) {
                mob.y+=mob.speed;
                if (mob.pos[2]==1) {
                    cAnimation();
                    mob.pos[2]++;
                }
            }
            //line 2
            else if (mob.x<=coordinates[2][0]-mob.area.width/2 &&
                mob.y>=coordinates[2][1]-mob.area.height/2) {
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
            else if (mob.y>=coordinates[3][1]-mob.area.height/2 &&
                mob.x>=coordinates[3][0]-mob.area.width/2) {
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
            else if (mob.x>=coordinates[4][0]-mob.area.width/2 &&
                mob.y<=coordinates[4][1]-mob.area.height/2) {
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
            else if (mob.y<=coordinates[5][1]-mob.area.height/2 &&
                mob.x<=coordinates[5][0]-mob.area.width/2) {
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
            else if (mob.x<=coordinates[6][0]-mob.area.width/2 &&
                mob.y>=coordinates[6][1]-mob.area.height/2) {
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
            else if (mob.y>=coordinates[7][1]-mob.area.height/2) {
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
            else if (mob.x>=coordinates[8][0]-mob.area.width) {
                mob.x-=mob.speed;
                if (mob.pos[3]==0) {
                    mob.pos=[0,0,0,1];
                }
                else if (mob.pos[3]==1) {
                    cAnimation();
                    mob.pos[3]++;
                }
            }
            else if (mob.x<=352) {
                if (!mob.dead) {
                    life-=1;
                    document.getElementById("life").innerHTML ="life: " + life;
                    mob.dead++;
                    stage.removeChild(mob);
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
                document.getElementById("life").innerHTML ="life: " + life;
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
    
    //testings
    output.text = "Paused = "+createjs.Ticker.getPaused()+"\n"+
        "Time = "+ time +"ticks"+ nticks +"\n" 

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
        document.getElementById("wave").innerHTML ="wave: " + wave;
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

//error text
function error(txt) {
    document.getElementById("errorText").innerHTML = txt;
    errorCD = 30;
}

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
            hitsT[0][i][j].on("mouseover", handleTower);
            hitsT[0][i][j].on("mouseout", handleTower);
            hitsT[0][i][j].on("click", handleTower); 
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
            hitsT[1][i][j].on("mouseover", handleTower);
            hitsT[1][i][j].on("mouseout", handleTower);
            hitsT[1][i][j].on("click", handleTower); 
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
            hitsT[2][i][j].on("mouseover", handleTower);
            hitsT[2][i][j].on("mouseout", handleTower);
            hitsT[2][i][j].on("click", handleTower); 
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
            hitsT[3][i][j].on("mouseover", handleTower);
            hitsT[3][i][j].on("mouseout", handleTower);
            hitsT[3][i][j].on("click", handleTower); 
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
            hitsT[4][i][j].on("mouseover", handleTower);
            hitsT[4][i][j].on("mouseout", handleTower);
            hitsT[4][i][j].on("click", handleTower); 
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
            hitsT[5][i][j].on("mouseover", handleTower);
            hitsT[5][i][j].on("mouseout", handleTower);
            hitsT[5][i][j].on("click", handleTower); 
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
            hitsT[6][i][j].on("mouseover", handleTower);
            hitsT[6][i][j].on("mouseout", handleTower);
            hitsT[6][i][j].on("click", handleTower); 
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
            hitsT[7][i][j].on("mouseover", handleTower);
            hitsT[7][i][j].on("mouseout", handleTower);
            hitsT[7][i][j].on("click", handleTower); 
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
            hitsT[8][i][j].on("mouseover", handleTower);
            hitsT[8][i][j].on("mouseout", handleTower);
            hitsT[8][i][j].on("click", handleTower); 
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
            hitsT[9][i][j].on("mouseover", handleTower);
            hitsT[9][i][j].on("mouseout", handleTower);
            hitsT[9][i][j].on("click", handleTower); 
            stage.addChild(hitsT[9][i][j]);
        };
    };
};



