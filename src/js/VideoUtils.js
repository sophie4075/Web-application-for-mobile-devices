export default class VideoUtils {

    pauseVideo(video) {
        if (video && !video.paused) {
            video.pause();
        }
    }

    setMediaPlayerPositionSaving(video) {
        video.addEventListener('pause', () =>
            localStorage.setItem(btoa(video.src), video.currentTime.toString())
        );

        video.addEventListener('play',  () => {
            let storedTime = parseFloat(localStorage.getItem(btoa(video.src)));
            if (storedTime !== null && storedTime < video.duration) {
                video.currentTime = storedTime;
            }
            video.play();
        });


    }


}