import * as bus from './bus'
import { ABILITY_BEAT, ABILITY_USE, ENEMY_BONK, ENEMY_DAMAGE, ENEMY_MOVE, ENEMY_TAKE_DAMAGE, POWERUP_ACQUIRED, RUNESTONE_LAND, RUNESTONE_MOVE, SIGIL_DRAWN } from './events';

function clamp(v, a, b) {
    return Math.min(Math.max(v, a), b);
}

function Audio() {
    audioCtx = new AudioContext();
    sampleRate = audioCtx.sampleRate;

    // Sounds to be loaded on init
    let attackHitSound;
    let runestoneLandedSound;
    let runestoneMoveSound;
    let powerupCollectSound;
    let enemyMoveSound;
    let enemySwordSound;
    
    let fireSound;
    let iceSound;
    let zapSound;

    let sigilCaret;
    let sigilCircle;
    let sigilBolt;
    let sigilTriangle;
    let sigilWave;
    let sigilHourglass;
    let sigilGarbage;

    // Musics
    let musicBuffer;
    
    let activeMusicSource;
    let gainNodeA;
    let gainNodeB;
    let usingA = true;

    const sin = (i) => Math.sin(i);
    const saw = (i) => ((i % 6.28) - 3.14) / 6.28;
    const sqr = (i) => clamp(Math.sin(i) * 1000, -1, 1);

    async function _yield() {
        return new Promise((r) => setTimeout(r, 0));
    }

    function setProgress(p) {
        bus.emit('load-progress', p);
    }

    async function generate(duration, fn) {
        let audioBuffer = audioCtx.createBuffer(1, sampleRate * duration, sampleRate);
        let buffer = audioBuffer.getChannelData(0);
        let N = audioBuffer.length;
        for (let i = 0; i < N; i++) {
            buffer[i] = fn(i * 44100 / sampleRate) * (1 - i/N);
        }
        await _yield();
        return audioBuffer;
    }

    async function init() {
        // Player swipe attack sound
        attackSound = await generate(0.2, (i) => {
            return 0.05 * saw(i/(0.3-220*Math.exp(-i/500)));
        });
        
        // HIT ENEMY sound
        attackHitSound = await generate(0.2, (i) => {
            return 0.15 * (sin(i/(20+i/150))*0.3 + Math.random());
        });

        // Enemy sword sounds
        enemySwordSound = await generate(0.2, (i) => {
            return 0.07 * saw(i/(0.3-220*Math.exp(-i/500)));
        });

        // Runestone landed
        runestoneLandedSound = await generate(0.25, (i) => {
            return 0.1 * (sqr(i/(120+i/250))*0.3 + Math.random())*(sqr(i/600)*0.5+0.5);
        });

        // Player jump sound
        runestoneMoveSound = await generate(0.1, (i) => {
            return 0.1 * sqr(i/(20+150*Math.exp(-i/1600)));
        });

        // Enemy move
        enemyMoveSound = await generate(0.3, (i) => {
            return 0.06 * (sin(i/(14+i*i/1e6)) + Math.random()/2);
        });

        // Collect powerup sound
        powerupCollectSound = await generate(0.3, (i) => {
            return 0.08 * sin(i/(100 - i / 20));
        });

        // fire sound
        fireSound = await generate(0.4, (i) => {
            return 0.16 * Math.random();
        });

        // ice sound
        iceSound = await generate(0.4, (i) => {
            return 0.11 * (sqr(i / (30 + i / 500)) * (sqr(i / (1500 + i / 60)) * 0.5 + 0.5) * (sqr(i / (600 + i / 40)) * 0.5 + 0.5));
        });

        // zap sound
        zapSound = await generate(0.5, (i) => {
            return 0.15 * (saw(i / (3 + i / 250)) + Math.random() * 0.1);
        });
        // setProgress(0.2);

        // Sigil sounds
        function sigilNote(i, pitch, time) {
            const q = Math.pow(2, -pitch/12) * 18;
            return 0.1 * (saw(i / q) * sin(i / (q*2 + 3 * sin(i/200000)))) * (i / 44100 - time > 0 ? 1 : 0) * Math.exp(-(i / 44100 - time) * 7);
        }
        sigilCaret = await generate(2.0, (i) => {
            return sigilNote(i, 0, 0) + sigilNote(i, 7, 0.15) + sigilNote(i, 0, 0.3);
        });
        sigilCircle = await generate(2.0, (i) => {
            return sigilNote(i, 2, 0) + sigilNote(i, 3, 0.15) + sigilNote(i, 5, 0.3);
        });
        sigilBolt = await generate(2.0, (i) => {
            return sigilNote(i, 12, 0) + sigilNote(i, 6, 0.15) + sigilNote(i, 0, 0.3);
        });
        sigilTriangle = await generate(2.0, (i) => {
            return sigilNote(i, 10, 0) + sigilNote(i, 10, 0.15) + sigilNote(i, 3, 0.3);
        });
        sigilWave = await generate(2.0, (i) => {
            return sigilNote(i, 5, 0) + sigilNote(i, 4, 0.15) + sigilNote(i, 5, 0.3);
        });
        sigilHourglass = await generate(2.0, (i) => {
            return sigilNote(i, 8, 0) + sigilNote(i, 1, 0.15) + sigilNote(i, 4, 0.3);
        });
        sigilGarbage = await generate(2.0, (i) => {
            return sigilNote(i, -4, 0) + sigilNote(i, -10, 0.15) + sigilNote(i, -4, 0.3);
        });


        // MUSIC GENERATION
        // drums
        const pace = sampleRate * 0.82;//1.06;
        const drumMusicBuffer = audioCtx.createBuffer(1, pace, sampleRate);
        const drumBuffer = drumMusicBuffer.getChannelData(0);
        const W = 0.1 * sampleRate;
        for (let j = 0; j < W; j++) {
            drumBuffer[j] += 0.06 * (sin(j/(70 + j/300)) + Math.random() / 3) * (1 - j / W);
            drumBuffer[parseInt(0.25 * pace) + j] += 0.02 * (saw(j/(80 - j/2000)) + Math.random() / 3) * (1 - j / W);
            drumBuffer[parseInt(0.5 * pace) + j] += 0.06 * Math.random() * (1 - j / W) + 0.06 * (sin(j/(70 + j/300)) + Math.random() / 3) * (1 - j / W);
            drumBuffer[parseInt(0.75 * pace) + j] += 0.02 * (saw(j/(80 - j/2000)) + Math.random() / 3) * (1 - j / W);
        }
        await _yield();

        // bass
        function bassNote(j, pitch) {
            const p = Math.pow(2, -pitch/12) * 80;
            return 0.25 * (sin(j/(p + j/9000))) * (1 - j / U);
        }
        const bassMusicBuffer = audioCtx.createBuffer(1, 16 * pace, sampleRate);
        const bassBuffer = bassMusicBuffer.getChannelData(0);
        const U = 0.25 * sampleRate;
        const bs = pace * 0.25;
        for (let o = 0; o < 4; o++) {
            const os = o * bs * 16;
            const br = [0, -5, -2, -7][o];
            for (let j = 0; j < U; j++) {
                bassBuffer[j + os] += bassNote(j, 0+br);
                bassBuffer[j + bs * 3 + os] += bassNote(j, 5+br);
                bassBuffer[j + bs * 4 + os] += bassNote(j, 7+br);
                bassBuffer[j + bs * 5 + os] += bassNote(j, 10+br);
                bassBuffer[j + bs * 7 + os] += bassNote(j, 12+br);
                bassBuffer[j + bs * 9 + os] += bassNote(j, 12+br);
                bassBuffer[j + bs * 10 + os] += bassNote(j, 10+br);
                bassBuffer[j + bs * 11 + os] += bassNote(j, 7+br);
                bassBuffer[j + bs * 12 + os] += bassNote(j, 12+br);
                bassBuffer[j + bs * 14 + os] += bassNote(j, 10+br);
            }
        }
        await _yield();

        // chords
        function chordNote(j, pitch) {
            const p = Math.pow(2, -pitch/12) * 20;
            return 0.04 * (sin(j/(p + Math.exp(-j/U * 4) * 5))) * clamp(1 - j / (U * 12), 0, 1) * (Math.pow(sin(j / 1550) * 0.5 + 0.5, 3));
        }
        const chordMusicBuffer = audioCtx.createBuffer(1, 16 * pace, sampleRate);
        const chordBuffer = chordMusicBuffer.getChannelData(0);
        for (let o = 0; o < 4; o++) {
            const os = o * bs * 16;
            const cr = [[-2, 3, 7], [-2, 2, 7], [-2, 2, 5], [-4, 0, 3]][o];
            for (let j = 0; j < U * 12; j++) {
                chordBuffer[j + os] += chordNote(j, cr[0]);
                chordBuffer[j + os] += chordNote(j, cr[1]);
                chordBuffer[j + os] += chordNote(j, cr[2]);
            }
        }
        await _yield();

        // lead
        function leadNote(j, pitch) {
            const p = Math.pow(2, -pitch/12) * 20;
            return 0.034 * saw(j/(p + sin(j/1000)*0.01)) * (1 - j / (U * 2));
        }
        const leadMusicBuffer = audioCtx.createBuffer(1, 16 * pace, sampleRate);
        const leadBuffer = leadMusicBuffer.getChannelData(0);
        for (let j = 0; j < U * 2; j++) {
            leadBuffer[j] += leadNote(j, 7);
            leadBuffer[j + bs * 3] += leadNote(j, 0);
            leadBuffer[j + bs * 6] += leadNote(j, 3);
            leadBuffer[j + bs * 7] += leadNote(j, 5);
            leadBuffer[j + bs * 8] += leadNote(j, 7);
            leadBuffer[j + bs * 11] += leadNote(j, 0);
            leadBuffer[j + bs * 14] += leadNote(j, 3);
            leadBuffer[j + bs * 15] += leadNote(j, 5);
            leadBuffer[j + bs * 16] += leadNote(j, 2);
            //
            leadBuffer[j + bs * 32] += leadNote(j, 5);
            leadBuffer[j + bs * (3+32)] += leadNote(j, -2);
            leadBuffer[j + bs * (6+32)] += leadNote(j, 2);
            leadBuffer[j + bs * (7+32)] += leadNote(j, 3);
            leadBuffer[j + bs * (8+32)] += leadNote(j, 5);
            leadBuffer[j + bs * (11+32)] += leadNote(j, -2);
            leadBuffer[j + bs * (14+32)] += leadNote(j, 3);
            leadBuffer[j + bs * (15+32)] += leadNote(j, 2);
            leadBuffer[j + bs * (16+32)] += leadNote(j, 0);
        }
        await _yield();

        // compose all music buffers
        musicBuffer = audioCtx.createBuffer(1, 8 * 4 * pace, sampleRate);
        const outBuffer = musicBuffer.getChannelData(0);
        for (let i = 0; i < outBuffer.length; i++) {
            outBuffer[i] += drumBuffer[i % drumBuffer.length];
            outBuffer[i] += bassBuffer[i % bassBuffer.length];
            outBuffer[i] += chordBuffer[i % chordBuffer.length];
            outBuffer[i] += leadBuffer[i % leadBuffer.length];
        }

        // bus events
        bus.on(ENEMY_BONK, play(attackHitSound));
        bus.on(ENEMY_TAKE_DAMAGE, play(attackHitSound));
        bus.on(RUNESTONE_MOVE, play(runestoneMoveSound));
        bus.on(RUNESTONE_LAND, play(runestoneLandedSound));
        bus.on(POWERUP_ACQUIRED, play(powerupCollectSound));
        bus.on(ENEMY_MOVE, play(enemyMoveSound));
        bus.on(ENEMY_DAMAGE, play(enemySwordSound));
        bus.on(ABILITY_BEAT, (t) => {
            play(({
                0: fireSound,
                1: iceSound,
                2: zapSound,
            })[t])();
        });
        bus.on(SIGIL_DRAWN, ([type, dir]) => {
            play(({
                0: sigilGarbage,
                5: sigilCaret,
                1: sigilCircle,
                3: sigilBolt,
                2: sigilTriangle,
                4: sigilWave,
                6: sigilHourglass,
            })[type])();
        });
        
        // crossfade gain nodes
        gainNodeA = new GainNode(audioCtx);
        gainNodeA.connect(audioCtx.destination);
        gainNodeB = new GainNode(audioCtx);
        gainNodeB.connect(audioCtx.destination);

        music(musicBuffer);
    }

    async function genericSongBuilder([melodySignature, beat], seed, prog1, prog2) {
        // Song builder
        const song = [];
        const drums = [];
        const noteLength = [4,2,0.5,3,4][seed];
        const noteSpace = [1,0.5,0.25,2,2][seed++];
        const bassNotes = [-15, -20, -19, -12];
        drums.push(
            [((seed * seed * 3) * 0.5) % 2, (seed) % 2],
            [((seed * seed * 3 + seed * 9) * 0.5) % 2, (seed+1) % 2],
            [((seed * seed * 2 + seed * 11) * 0.5) % 2, (seed+1) % 2],
        );
        setProgress(prog1);
        for (let i = 0; i < 3; i++) {
            const o = i * 8;
            const q = [0,3,-5][i];
            for (let j = 0; j < 8; j++) {
                song.push([bassNotes[(seed*7+i*2+(j>>1)+j*j*3) % 4]+q, j+o, 6, 1]);
            }
            for (let j = 0; j < 8/noteSpace; j++) {
                if ((j + j*j + i+seed*3) % 7 < 4) {
                    song.push([-3+q+melodySignature[(j + j*j*2 + i*i*2+seed) % melodySignature.length], j * noteSpace + o, noteLength, 2]);
                }
            }
        }

        // Song buffer writer
        const targetBuffer = audioCtx.createBuffer(1, sampleRate * 8 * 3 * beat, sampleRate);
        const buffer = targetBuffer.getChannelData(0);
        for (let i = 0; i < song.length; i++) {
            let note, start, duration, amp;
            [note, start, duration, amp] = song[i];

            // Write note
            const baseIdx = parseInt(start * beat * sampleRate);
            const dur = duration * beat * sampleRate;
            for (let i = 0; i < dur; i++) {
                let v = 0; 
                const envelope = i / dur; 
                v+= (amp == 1) ?
                    clamp(sin(i / (6*(2**(-note/12))*2 * 2) + sin(i/8000))*(Math.exp(-envelope*23) * 44 + 1),-1,1) * 2 :
                    saw(i / (4.03 * 6*(2**(-note/12))*2)) * 7;
                buffer[baseIdx + i] += v * Math.min(envelope * Math.exp(-envelope * (10 + amp * 7)) * 100, 1) / 500;
            }
            await _yield();
            setProgress(prog1 + (prog2 - prog1) * (i/song.length) * 0.8);
        }
        for (let q = 0; q < 44; q+=2) {
            for (let j = 0; j < drums.length; j++) {
                let type, drumStart;
                [drumStart, type] = drums[j];
                const noteOffset = parseInt(0.5 * sampleRate * type);
                const startOffset = parseInt((drumStart + q) * sampleRate * beat);
                for (let k = 0; k < sampleRate * 0.1; k++) {
                    buffer[k + startOffset] += drumBuffer[k + noteOffset];
                }
            }
            await _yield();
            setProgress(prog1 + (prog2 - prog1) * (0.8 + 0.2 * (q/44)));
        }
        return targetBuffer;
    }

    function play(audioBuffer) {
        return () => {
            let source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioCtx.destination);
            source.start();
        }
    };

    function music(musicBuffer) {
        let audioToStop = activeMusicSource;

        activeMusicSource = audioCtx.createBufferSource();
        activeMusicSource.buffer = musicBuffer;
        activeMusicSource.loop = true;
        activeMusicSource.connect(usingA ? gainNodeA : gainNodeB);
        activeMusicSource.start();

        setTimeout(() => { audioToStop?.stop() }, 700);
        gainNodeA.gain.setTargetAtTime(usingA ? 1 : 0, audioCtx.currentTime, 0.5);
        gainNodeB.gain.setTargetAtTime(usingA ? 0 : 1, audioCtx.currentTime, 0.5);
        usingA = !usingA;
    }

    return {
        init,
    }
}

export default Audio;