var tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
let slideshowInstances = [];

class Slideshow {
    constructor(playerIds, videoIds, slideshowId) {
        this.players = [];
        this.nowPlayingIndex = 0;
        this.autoPlayTimer = null;
        this.width = null;
        this.height = null;
        this.slideshowId = slideshowId;

        this.createPlayer = (elementId, videoId) => {
            if (window.innerWidth <= "992") {
                this.width = window.innerWidth + "px";
                this.height = (window.innerWidth / 16) * 9 + "px";
            } else {
                this.width = "900px";
                this.height = "506px";
            }
            return new YT.Player(elementId, {
                videoId: videoId,
                width: this.width,
                height: this.height,
                playerVars: {
                    autoplay: 0,
                },
                events: {
                    onStateChange: this.onPlayerStateChange,
                },
            });
        };

        this.createPlayers = (playerIds, videoIds) => {
            for (let i = 0; i < playerIds.length; i++) {
                this.players.push(this.createPlayer(playerIds[i], videoIds[i]));
            }
        };

        this.onPlayerStateChange = (event) => {
            if (event.data === YT.PlayerState.PLAYING) {
                this.stopAutoPlayTimer();
            } else if (event.data === YT.PlayerState.PAUSED) {
                this.startAutoPlayTimer();
            } else if (event.data === YT.PlayerState.ENDED) {
                this.changeSlide(1);
            }
        };

        this.playVideo = (index) => {
            let errorOccurred = false
            try {
                this.players.forEach((player) => player.pauseVideo());
            } catch (error) {
                errorOccurred = true
            } finally {
                if (errorOccurred) {
                    this.playVideo()
                }
            }
            this.nowPlayingIndex = index;
            this.updateDots();
            this.startAutoPlayTimer();
        };

        this.changeSlide = (delta) => {
            const newIndex = (this.nowPlayingIndex + delta + this.players.length) % this.players.length;
            setTimeout(() => {
                this.slideTo(newIndex);
                this.playVideo(newIndex);
            }, 5);
        };

        this.jumpToSlide = (index) => {
            this.slideTo(index);
            this.playVideo(index);
        };

        this.slideTo = (index) => {
            const slideshowInstance = document.querySelector(".slideshow-" + this.slideshowId);
            const container = slideshowInstance.querySelector(".slideshow-container");
            const slides = container.querySelectorAll(".slide");
            const slideWidth = slides[0].clientWidth;
            const position = -index * slideWidth;
            container.style.transform = `translateX(${position}px)`;
            this.updateDots();
        };

        this.updateDots = () => {
            const slideshowInstance = document.querySelector(".slideshow-" + this.slideshowId);
            const dots = slideshowInstance.querySelectorAll(".dot");
            dots.forEach((dot, index) => {
                dot.classList.toggle("activeDot", index === this.nowPlayingIndex);
            });
        };

        this.checkActiveVideoState = () => {
            const activePlayer = this.players[this.nowPlayingIndex];
            if (activePlayer.getPlayerState() !== YT.PlayerState.PLAYING) {
                this.changeSlide(1);
            }
        };

        this.startAutoPlayTimer = () => {
            if (this.autoPlayTimer) {
                clearTimeout(this.autoPlayTimer);
            }
            let errorOccurred = false;
            this.autoPlayTimer = setTimeout(() => {
                try {
                    const currentState = this.players[this.nowPlayingIndex].getPlayerState();
                    if (currentState !== YT.PlayerState.PLAYING) {
                        this.changeSlide(1);
                    }
                } catch (error) {
                    errorOccurred = true;
                } finally {
                    // Restart the timer regardless of whether there was an error or not
                    if (errorOccurred) {
                        this.startAutoPlayTimer();
                    }
                }
            }, 5000);
        };


        this.stopAutoPlayTimer = () => {
            if (this.autoPlayTimer) {
                clearTimeout(this.autoPlayTimer);
            }
        };

        this.onNewVideoStarted = () => {
            this.stopAutoPlayTimer();
            this.startAutoPlayTimer();
        };

        this.createPlayers(playerIds, videoIds);
        this.startAutoPlayTimer();

    }
}

function createNavigation(slideshowIndex, totalSlides) {
    const prevButton = document.createElement('button');
    prevButton.className = 'prev';
    prevButton.onclick = () => changeSlide(slideshowInstances[slideshowIndex - 1], -1);

    const nextButton = document.createElement('button');
    nextButton.className = 'next';
    nextButton.onclick = () => changeSlide(slideshowInstances[slideshowIndex - 1], 1);

    const dotContainer = document.createElement('div');
    dotContainer.className = 'dot-container';

    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('span');
        dot.className = i === 0 ? 'dot activeDot' : 'dot';
        dot.onclick = () => jumpToSlide(slideshowInstances[slideshowIndex - 1], i);
        dotContainer.appendChild(dot);
    }

    const slideshowContainer = document.querySelector(`.slideshow-${slideshowIndex}`);
    const navContainer = slideshowContainer.querySelector('.nav-container');
    navContainer.appendChild(prevButton);
    navContainer.appendChild(nextButton);

    const dotContainerElement = slideshowContainer.querySelector('.dot-container');
    dotContainerElement.appendChild(dotContainer);
}

function onYouTubeIframeAPIReady() {
    const slideshowElements = document.querySelectorAll('[class^="slideshow-"]');

    function createSlideshow(index) {
        if (index >= slideshowElements.length) {
            return;
        }

        const slideshowElement = slideshowElements[index];
        const classList = slideshowElement.classList;
        const slideshowId = getClassWithNumericSuffix(classList);

        if (slideshowId !== null) {
            const playerIds = [];
            const videoIds = [];

            const slideElements = slideshowElement.querySelectorAll('.slide');
            slideElements.forEach((slideElement) => {
                const playerElement = slideElement.querySelector('.youtube-player');
                if (playerElement) {
                    playerIds.push(playerElement.id);
                    videoIds.push(playerElement.id);
                }
            });

            if (playerIds.length > 0 && videoIds.length > 0) {
                const slideshowInstance = new Slideshow(playerIds, videoIds, slideshowId);
                slideshowInstances.push(slideshowInstance);
                createNavigation(slideshowId, playerIds.length);
            }
        }

        setTimeout(() => {
            createSlideshow(index + 1);
        }, 100);
    }

    createSlideshow(0);
}

function getClassWithNumericSuffix(classList) {
    const regex = /^slideshow-(\d+)$/;
    for (const className of classList) {
        const match = className.match(regex);
        if (match) {
            return parseInt(match[1]);
        }
    }
    return null;
}

function changeSlide(slideshow, delta) {
    console.log(slideshow)
    slideshow.changeSlide(delta);

}

function jumpToSlide(slideshow, index) {
    slideshow.jumpToSlide(index);
}