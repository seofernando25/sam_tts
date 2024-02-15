<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import Slider from "$lib/components/ui/slider/slider.svelte";
    import { Input } from "$lib/components/ui/input";
    import { persisted } from "$lib/persisted";
    import { Label } from "$lib/components/ui/label";

    const DEFAULT_TEXT = "Hello my name is SAM";
    let text = persisted("text", DEFAULT_TEXT);
    let pitch = persisted("pitch", [144]);
    let speed = persisted("speed", [144]);
    let mouth = persisted("mouth", [144]);
    let throat = persisted("throat", [144]);

    $: audioUrl = `/speak?text=${$text}&mouth=${$mouth}&throat=${$throat}&speed=${$speed}&pitch=${$pitch}`;

    let currentAudioUrl = audioUrl;

    type AudioEntry = { text: string } & SamJsOptions;

    let saved: AudioEntry[] = [];
    let audio: HTMLAudioElement | null = null;

    const play = () => {
        if ($text == "") {
            $text = DEFAULT_TEXT;
        }

        if (currentAudioUrl === audioUrl) {
            audio?.play();
        }

        currentAudioUrl = audioUrl;
        if (audio) {
            audio.oncanplay = () => {
                audio?.play();
            };
        }
    };

    const save = () => {
        if ($text == "") {
            return;
        }

        saved = [
            {
                text: $text,
                mouth: $mouth[0],
                throat: $throat[0],
                speed: $speed[0],
                pitch: $pitch[0],
            },
            ...saved,
        ];
    };

    // On enter pl
</script>

<svelte:window on:keydown={(e) => e.key === "Enter" && play()} />

<div class="flex">
    <!-- Input -->
    <div class="flex flex-col gap-4 w-1/2">
        <Label for="text">Text to speak</Label>
        <Input type="text" placeholder={DEFAULT_TEXT} bind:value={$text} />

        <Label for="pitch">Pitch: {$pitch[0]}</Label>
        <Slider min={0} max={255} step={1} bind:value={$pitch} />

        <Label for="speed">Speed: {$speed[0]}</Label>
        <Slider min={0} max={255} step={1} bind:value={$speed} />

        <Label for="mouth">Mouth: {$mouth[0]}</Label>
        <Slider min={0} max={255} step={1} bind:value={$mouth} />

        <Label for="throat">Throat: {$throat[0]}</Label>
        <Slider min={0} max={255} step={1} bind:value={$throat} />

        <Button disabled={!$text} on:click={play}>Play</Button>
        <Button on:click={save}>Save</Button>

        <audio bind:this={audio} controls volume="0.5" src={currentAudioUrl}
        ></audio>
    </div>

    <!-- Values -->
    <div>
        {#each saved as entry (entry.text)}
            <!-- TODO: ADD remove button -->
            <div>
                <p>Text: {entry.text}</p>
                <p>Mouth: {entry.mouth}</p>
                <p>Throat: {entry.throat}</p>
                <p>Speed: {entry.speed}</p>
                <p>Pitch: {entry.pitch}</p>
                <!-- Audio at /speak?text=...&mouth=...&throat=...&speed=...&pitch=... -->
                <audio
                    controls
                    src="/speak?text={entry.text}&mouth={entry.mouth}&throat={entry.throat}&speed={entry.speed}&pitch={entry.pitch}"
                ></audio>
            </div>
        {/each}
    </div>
</div>
