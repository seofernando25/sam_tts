<script lang="ts">
    import { getFormField } from "formsnap";
    import type { HTMLInputAttributes } from "svelte/elements";
    import { Input, type InputEvents } from "$lib/components/ui/input";
    import Slider from "../slider/slider.svelte";

    type $$Props = HTMLInputAttributes;
    type $$Events = InputEvents;

    const { attrStore, value } = getFormField();

    let sliderValue: number[];
    $: if (sliderValue !== undefined) {
        let firstValue = sliderValue[0];
        if (firstValue !== undefined) {
            value.set(firstValue);
        }
    }
</script>

<Slider
    {...$attrStore}
    bind:value={sliderValue}
    {...$$restProps}
    on:blur
    on:change
    on:click
    on:focus
    on:keydown
    on:keypress
    on:keyup
    on:mouseover
    on:mouseenter
    on:mouseleave
    on:paste
    on:input
/>
