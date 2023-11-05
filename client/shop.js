var shopMax = 10;
var shopPoints = 10;
var shopSeconds = 0;
var shopSettings = {
    damage: 0,
    speed: 0,
    health: 0,
    shield: 0,
    gunA: 0,
    gunB: false,
    gunC: false,
}

function setupShop(level){
    shopSettings = {
        damage: 0,
        speed: 0,
        health: 0,
        shield: 0,
        gunA: 0,
        gunB: false,
        gunC: false,
    }
    if(!level)level=0;
    shopMax = level
    shopPoints = level
    $("#chooseShot0,#chooseShot1,#chooseShot2,#chooseShot3,#chooseShot4,#chooseShot5").removeClass("unselectableWeapon")
    $("#chooseShot0,#chooseShot1,#chooseShot2,#chooseShot3,#chooseShot4,#chooseShot5").addClass("button")
    $("#chooseShot0,#chooseShot1,#chooseShot2,#chooseShot3,#chooseShot4,#chooseShot5").addClass("weaponSelect")
    if(shopMax < 10){
        $("#chooseShot5").removeClass("weaponSelect").removeClass("button").addClass("unselectableWeapon")
    }
    if(shopMax < 8){
        $("#chooseShot4").removeClass("weaponSelect").removeClass("button").addClass("unselectableWeapon")
    }
    if(shopMax < 6){
        $("#chooseShot3").removeClass("weaponSelect").removeClass("button").addClass("unselectableWeapon")
    }
    if(shopMax < 4){
        $("#chooseShot2").removeClass("weaponSelect").removeClass("button").addClass("unselectableWeapon")
        $("#chooseShot1").removeClass("weaponSelect").removeClass("button").addClass("unselectableWeapon")
    }
    $("#upD0,#upD1,#upD2,#upD3,#upD4,#upD5").removeClass("upgraded")
    $("#upS0,#upS1,#upS2,#upS3,#upS4,#upS5").removeClass("upgraded")
    $("#upH0,#upH1,#upH2,#upH3,#upH4,#upH5").removeClass("upgraded")
    $("#upSH0,#upSH1").removeClass("upgraded")
    
    if(shopMax >= 4){shopChooseShot(1)}
    if(shopMax >= 8){shopChooseShot(4)}
    $("#buyScreen").css("display","inline-block")
    updateShopText()
}

function shopChooseShot(type){
    if(type == 1 && shopMax >= 4){
        $("#chooseShot1").addClass("shotSelected")
        $("#chooseShot2").removeClass("shotSelected")
        $("#chooseShot3").removeClass("shotSelected")
        shopSettings.gunB = 1
    }
    if(type == 2 && shopMax >= 4){
        $("#chooseShot1").removeClass("shotSelected")
        $("#chooseShot2").addClass("shotSelected")
        $("#chooseShot3").removeClass("shotSelected")
        shopSettings.gunB = 2
    }
    if(type == 3 && shopMax >= 6){
        $("#chooseShot1").removeClass("shotSelected")
        $("#chooseShot2").removeClass("shotSelected")
        $("#chooseShot3").addClass("shotSelected")
        shopSettings.gunB = 4
    }
    if(type == 4 && shopMax >= 8){
        $("#chooseShot4").addClass("shotSelected")
        $("#chooseShot5").removeClass("shotSelected")
        shopSettings.gunC = 3
    }
    if(type == 5 && shopMax >= 10){
        $("#chooseShot4").removeClass("shotSelected")
        $("#chooseShot5").addClass("shotSelected")
        shopSettings.gunC = 5
    }
}

function upS(dir){
    if(dir == 1 && shopPoints <= 0) return;
    if(dir == 1 && shopSettings.speed >= 6) return;
    if(dir == -1 && shopSettings.speed == 0) return;
    shopSettings.speed += dir;
    shopPoints -= dir;
    for(let i = 0; i <= 6; i++){
        if(i < shopSettings.speed){
            $("#upS"+i).addClass("upgraded")
        }
        else {
            $("#upS"+i).removeClass("upgraded")
        }
    }
    updateShopText()
}
function upD(dir){
    if(dir == 1 && shopPoints <= 0) return;
    if(dir == 1 && shopSettings.damage >= 6) return;
    if(dir == -1 && shopSettings.damage == 0) return;
    shopSettings.damage += dir;
    shopPoints -= dir;
    for(let i = 0; i <= 6; i++){
        if(i < shopSettings.damage){
            $("#upD"+i).addClass("upgraded")
        }
        else {
            $("#upD"+i).removeClass("upgraded")
        }
    }
    updateShopText()
}
function upH(dir){
    if(dir == 1 && shopPoints <= 0) return;
    if(dir == 1 && shopSettings.health >= 6) return;
    if(dir == -1 && shopSettings.health == 0) return;
    shopSettings.health += dir;
    shopPoints -= dir;
    for(let i = 0; i <= 6; i++){
        if(i < shopSettings.health){
            $("#upH"+i).addClass("upgraded")
        }
        else {
            $("#upH"+i).removeClass("upgraded")
        }
    }
    updateShopText()
}
function upSH(dir){
    if(dir == 1 && shopPoints <= 0) return;
    if(dir == 1 && shopSettings.shield >= 2) return;
    if(dir == -1 && shopSettings.shield == 0) return;
    shopSettings.shield += dir;
    shopPoints -= dir;
    for(let i = 0; i <= 2; i++){
        if(i < shopSettings.shield){
            $("#upSH"+i).addClass("upgraded")
        }
        else {
            $("#upSH"+i).removeClass("upgraded")
        }
    }
    updateShopText()
}

function updateShopText(){
    $("#shopText").html("You are a Level " + shopMax + "<br>You have " + shopPoints + " points left")
}

function closeAndApplyShop(){
    $("#buyScreen").css("display","none")
    myStats.damageModifier = upgradeMappings.damage[shopSettings.damage]
    myStats.speed = upgradeMappings.speed[shopSettings.speed]
    myUpgrades.shield = shopSettings.shield;
    myStats.health = upgradeMappings.health[shopSettings.health]
    myStats.maxHealth = upgradeMappings.health[shopSettings.health]
    myStats.gunA = 0;
    myStats.gunB = shopSettings.gunB;
    myStats.gunC = shopSettings.gunC;
    
    updateUIBasedOnStats()
    hasClosedShop = true;
    saveGameState()
}

var upgradeMappings = {
    speed: [0.8, 1.05, 1.15, 1.2, 1.3, 1.35, 1.6],
    damage: [1,1.3,1.6,1.8,2,2.2,2.5,2.7],
    health: [10,17,27,32,40,43,56],
}

function updateUIBasedOnStats(){
    if(myStats.gunB){$("#shotSelect1").css("display", "inline-block")}else{$("#shotSelect1").css("display", "none")}
    if(myStats.gunC){$("#shotSelect2").css("display", "inline-block")}else{$("#shotSelect2").css("display", "none")}
    $("#shotSelect1").css("background-position", ("-"+myStats.gunB*95+"em"))
    $("#shotSelect2").css("background-position", ("-"+myStats.gunC*95+"em"))
    if(myUpgrades.shield == 0){
        $("#holdSpaceMessage").css("visibility", "hidden")
    }
    else {
        $("#holdSpaceMessage").css("visibility", "visible")
    }
}