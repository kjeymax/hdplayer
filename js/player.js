let demo_video_url = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

var art;
var video_url = '';
$('.form-control').on('submit', (e) => {
	e.preventDefault();
	let temp_video_url = $('.form-control>.url').val();
	if (temp_video_url == '') {
		layer.msg('Please enter the video URL');
		return false;
	}
	if (video_url == temp_video_url) {
		layer.msg('Video URL has not changed');
		art.play();
		return false;
	}
	layer.msg('play video');
	video_url = $('.form-control>.url').val();
	playVideo(video_url);
});

$(document).ready(function() {
	let hash = window.location.hash;
	if (hash.startsWith('video_url=', 1)) {
		let temp_video_url = decodeURIComponent(hash.substr(11));
		playVideo(temp_video_url);
	}
});

var playVideo = (videoUrl) => {
	$('.main').removeClass('ready');
	if (videoUrl == '') {
		videoUrl = demo_video_url;
		layer.open({
			icon: 5,
			time: 5 * 1000,
			title: 'Error message',
			content: 'Please enter the m3u8 video address. The currently playing video is a demo video.',
			btn: ['knew']
		});
	}
	if (videoUrl) {
		$('.form-control>.url').val(videoUrl);
		window.location.hash = 'video_url=' + encodeURIComponent(videoUrl);
	}
	//console.log('art:', art)
	if (art?.id) {
		art.destroy();
	}
	try {
		art = new Artplayer({
			container: '.player',
			url: videoUrl,
			title: 'H-Donghua Video player',
			loop: true, // 区间循序播放
			flip: true, // 画面翻转
			playbackRate: true, // 播放速度
			aspectRatio: true, // 画面比例
			screenshot: true, // 截屏
			setting: true, // 设置
			pip: true, // 画中画
			fullscreenWeb: true, // 网页全屏
			fullscreen: true, // 全屏
			subtitleOffset: true, // 字幕偏移
			miniProgressBar: true, // 迷你进度条
			airplay: true,
			theme: '#23ade5',
			thumbnails: {},
			subtitle: {},
			highlight: [{
				time: 15,
				text: 'Welcome to H-Donghua m3u8 player',
			}],
			icons: {
				loading: '<img src="images/loading.gif" width="100px" title="Video loading..." />'
			},
			settings: [{
				html: 'control bar floating',
				icon: '<img width="22" heigth="22" src="images/state.svg">',
				tooltip: 'turn on',
				switch: true,
				onSwitch: async (item) => {
					item.tooltip = item.switch ? 'turn off' : 'turn on';
					art.plugins.artplayerPluginControl.enable = !item.switch;
					await Artplayer.utils.sleep(300);
					art.setting.updateStyle();
					return !item.switch;
				},
			}],
			customType: {
				m3u8: playM3u8,
			},
			plugins: [
				artplayerPluginControl(),
				artplayerPluginHlsQuality({
					control: true, // 显示在控制栏
					setting: false, // 显示在设置
					title: 'Quality', // I18n
					auto: 'Auto',
				})
			],
		});
		art.on('ready', () => {
			setTimeout(() => {
				layer.msg('start playing');
				art.play();
			}, 100);
		});
	} catch (e) {
		console.error('An abnormality occurs:', e)
	}
}

var playM3u8 = (video, url, art) => {
	if (Hls.isSupported()) {
		const hls = new Hls();

		art.hls = hls;
		art.hls.loadSource(url);
		art.hls.attachMedia(video);

		art.once('url', () => hls.destroy());
		art.once('destroy', () => hls.destroy());
	} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
		art.switchUrl(url);
		art.seek = 0;
	} else {
		art.notice.show = 'Unsupported playback format: m3u8';
	}
}