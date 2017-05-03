var mazhe = function(){

	this.file 	      = null;
	this.fileName 	  = null;
	this.audioContext = null;
	this.source       = null;
};

//统一浏览器API
mazhe.prototype._perpareAPI = function(){

	//AudioContext
	window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
	//requestAnimationFrame
	window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;

	try{

		this.audioContext = new AudioContext();
	}catch(e){

		console.log('实例化audioContext失败');
	}
};

//给file绑定事件
mazhe.prototype._addEventListenr = function(){

	var that 	      = this,
		audioInput    = document.getElementById('uploadFile'),
		drapContainer = document.getElementsByTagName('canvas')[0],
		selected     = document.getElementById('selected');

	audioInput.onchange = function(){

		if(audioInput.files.length !== 0){

			that.file     = audioInput.files[0];
			that.fileName = audioInput.files[0].name;
			selected.innerHTML = audioInput.files[0].name;
			that._start();
		}
	}

};

mazhe.prototype._start = function(){

	var that = this,
		file = this.file,
		fr   = new FileReader();

	fr.onload = function(e){

		var fileResult   = e.target.result;
		var audioContext = that.audioContext;
		audioContext.decodeAudioData(fileResult, function(buffer){
			that._mazhe(audioContext, buffer);
		}, function(e){
			console.log('解码失败');
		});
	};

	fr.readAsArrayBuffer(file);
};

mazhe.prototype._mazhe = function(audioContext, buffer){

	var audioBufferSouceNode = audioContext.createBufferSource(),
		analyser 			  = audioContext.createAnalyser();

	audioBufferSouceNode.connect(analyser);
	analyser.connect(audioContext.destination);
	audioBufferSouceNode.buffer = buffer;
	audioBufferSouceNode.start(0);
	this._draw(analyser);
};

mazhe.prototype._draw = function(analyser){

    var canvas = document.getElementById('Tiantian'),
        cwidth = canvas.width,
        cheight = canvas.height - 2,
        meterWidth = 10, //频谱条宽度
        gap = 2, //频谱条间距
        capHeight = 2,
        capStyle = '#fff',
        meterNum = 800 / (10 + 2), //频谱条数量
        capYPositionArray = []; //将上一画面各帽头的位置保存到这个数组
    ctx = canvas.getContext('2d');
    gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(1, '#0f0');
    gradient.addColorStop(0.5, '#ff0');
    gradient.addColorStop(0, '#f00');
    var drawMeter = function() {
        var array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        var step = Math.round(array.length / meterNum); //计算采样步长
        ctx.clearRect(0, 0, cwidth, cheight);
        for (var i = 0; i < meterNum; i++) {
            var value = array[i * step]; //获取当前能量值
            if (capYPositionArray.length < Math.round(meterNum)) {
                capYPositionArray.push(value); //初始化保存帽头位置的数组，将第一个画面的数据压入其中
            };
            ctx.fillStyle = capStyle;
            //开始绘制帽头
            if (value < capYPositionArray[i]) { //如果当前值小于之前值
                ctx.fillRect(i * 12, cheight - (--capYPositionArray[i]), meterWidth, capHeight); //则使用前一次保存的值来绘制帽头
            } else {
                ctx.fillRect(i * 12, cheight - value, meterWidth, capHeight); //否则使用当前值直接绘制
                capYPositionArray[i] = value;
            };
            //开始绘制频谱条
            ctx.fillStyle = gradient;
            ctx.fillRect(i * 12, cheight - value + capHeight, meterWidth, cheight);
        }
        requestAnimationFrame(drawMeter);
    }
    requestAnimationFrame(drawMeter);
};

var Tiantian = new mazhe();
Tiantian._perpareAPI();
Tiantian._addEventListenr();

