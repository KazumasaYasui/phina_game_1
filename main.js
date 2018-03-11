// ゲームの定数作成
var SCREEN_WIDTH = 960;
var SCREEN_HEIGHT = 640;
var RESULT_PARAM = {
	score: 256,
	// msg: "うんちを避けろ！",
// 	hashtags: "",
// 	url: "",
	width: SCREEN_WIDTH,
	height: SCREEN_HEIGHT,
};
var PLAYER_WIDTH = 20;
var PLAYER_HEIGHT = 16;
var PLAYER_GROUND_LIMIT_LEFT = PLAYER_WIDTH/2;
var PLAYER_GROUND_LIMIT_RIGHT = SCREEN_WIDTH - PLAYER_WIDTH/2;
var ENEMY_WIDTH = 25;
var ENEMY_HEIGHT = 25;

// リソースの読み込み
var ASSETS = {
	image: {
		"player": "./cat.png",
		"enemy": "./unchi.png",
		"map": "./back.png",
	},
	// spritesheet: {
	// 	"playerSS": "./playerSS.ss",
	// },
	sound: {
		// "bgm": "https://raw.githubusercontent.com/KazumasaYasui/phina_game_2/master/bgm.mp3",
    "bgm": "./bgm.mp3",
	},
};

// ゲーム起動処理
phina.globalize();
phina.main(function() {
	var app = GameApp({
		startLabel: 'title',
		assets: ASSETS,
		width: SCREEN_WIDTH,
		height: SCREEN_HEIGHT,
	});
	app.run();
});

// タイトルシーン
phina.define("TitleScene", {
	superClass: "phina.game.TitleScene",
	init: function() {
		this.superInit({
			title: "うんちを避けろ！",
			backgroundColor: 'rgb(255,20,147)',
			width: SCREEN_WIDTH,
			height: SCREEN_HEIGHT,
		});
	},
});

// メインシーン
phina.define("MainScene", {
	superClass: "DisplayScene",
	init: function() {
		this.superInit({
			width: SCREEN_WIDTH,
			height: SCREEN_HEIGHT,
		});
		// BGM設定
		this.bgm = phina.asset.AssetManager.get("sound", "bgm");
		this.bgm.setLoop(true).play();
		// Map設定
		this.map = phina.display.Sprite("map")
			.setOrigin(0, 0)
			.setScale(2)
			.addChildTo(this);
		// ねこ設定
		this.player = Player().addChildTo(this);
		this.player.position.set(150, 600);
		// うんち設定
		this.enemyGroup = phina.display.DisplayElement().addChildTo(this);
		// スコア用カウントアップ
		this.timer = 0;
		// ラベル表示
		this.timeLabel = phina.display.Label({
			text: " ",
			fill: "white",
			fontSize: 40,
		}).setPosition(200, 60).addChildTo(this);
	},
	update: function(app) {
		// カウントアップ
		++this.timer;
		// 制限時間表示
		this.timeLabel.text = "生存時間:"+((this.timer/30) |0);
		// うんちの生成
		if (this.timer % 30 === 0) {
			for (var i = 0, n = (this.timer/300); i < n; ++i){
				var enemy = Enemy().addChildTo(this.enemyGroup);
				enemy.x = Math.randint(0, SCREEN_WIDTH);
				enemy.y = 0 - enemy.height;
			}
		}
		var self = this;
		var ec = this.enemyGroup.children;
		ec.each(function(enemy) {
			if (self.player.hitTestElement(enemy)) {
				self.bgm.stop();
				app.replaceScene(EndScene(self.timer))
			};
		});
	},
});

// エンドシーン
phina.define("EndScene", {
	superClass: "phina.game.ResultScene",
	init: function(time) {
		// スコア計算
		RESULT_PARAM.score = (Math.floor(time*100/30)/100)+"秒生存しました！";
		// スコア
		this.superInit(RESULT_PARAM);
	},
	// Backボタンでタイトルに
	onnextscene: function (e) {
		e.target.app.replaceScene(TitleScene());
	},
});

// ねこ
phina.define("Player", {
	superClass: "phina.display.Sprite",
	init: function() {
		this.superInit("player", PLAYER_WIDTH, PLAYER_HEIGHT);
		this.setScale(4);
		// var ss = phina.accessory.FrameAnimation("playerSS");
		// ss.attachTo(this);
		// this.ss = ss;
		// 移動方向を保持
		this.direct = "right";
		// this.ss.gotoAndPlay(this.direct);
		// スマホで加速度使用のため、タッチ入力移動をさせない
		this.update = this.updateNotMobile;
	},
	moveLimit: function () {
		// 画面からはみ出ないようにする
		if (this.x < PLAYER_GROUND_LIMIT_LEFT) {
			this.x = PLAYER_GROUND_LIMIT_LEFT;
		}
		if (this.x > PLAYER_GROUND_LIMIT_RIGHT) {
			this.x = PLAYER_GROUND_LIMIT_RIGHT;
		}
	},
	clickLeft: function () {
		this.x -= 4;
	},
	clickRight: function () {
		this.x += 4;
	},
	updateNotMobile: function (app) {
		// タッチしたら動く方向を逆にする
		if (app.pointer.getPointingStart()) {
			this.direct = (this.direct === "left") ? "right" : "left";
			// this.ss.gotoAndPlay(this.direct);
		}
		// 移動処理
		switch (this.direct) {
			case "left":
				this.clickLeft();
				break;
			case "right":
				this.clickRight();
				break;
		}
		// 移動の限界
		this.moveLimit();
	},
});

// うんち
phina.define("Enemy", {
	superClass: "phina.display.Sprite",
	init: function() {
		this.superInit("enemy");
		this.width = ENEMY_WIDTH*4;
		this.height = ENEMY_HEIGHT*4;
		this.speed = Math.randint(6, 12);
	},
	update: function() {
		this.y += this.speed;
		// 画面から見えなくなったら消す
		if (this.y > SCREEN_HEIGHT + this.height) {
			this.remove();
		}
	}
});











