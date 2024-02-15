<script lang="ts">
    import { ModeWatcher } from "mode-watcher";
    import "../app.pcss";
    import { LightSwitch } from "$lib/components/ui/light-switch";
</script>

<header class="p-4 flex-col gap-8">
    <div class="flex gap-5 items-center">
        <h1 class="text-4xl font-bold">sam_tts</h1>
        <code>
            API: /speak?text=${"{"}TEXT{"}"}&mouth=${"{"}MOUTH{"}"}&throat={"{"}THROAT{"}"}&speed={"{"}SPEED{"}"}&pitch={"{"}PITCH{"}"}
        </code>

        <div class="flex-1"></div>
        <LightSwitch />
    </div>
    <p class="text-sm">
        Made with the
        <a class="underline" href="https://github.com/discordier/sam">
            discordier/sam
        </a> library.
    </p>
</header>

<ModeWatcher />

<div class="p-4">
    <slot />
</div>
