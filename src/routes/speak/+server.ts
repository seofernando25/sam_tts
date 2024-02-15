import type { RequestHandler } from "@sveltejs/kit";
import { z } from "zod";
import SamJs from "sam-js";

const speakSchema = z.object({
    text: z.string(),
    pitch: z.preprocess(Number, z.number().min(0).max(255).default(128)),
    speed: z.preprocess(Number, z.number().min(0).max(255).default(128)),
    mouth: z.preprocess(Number, z.number().min(0).max(255).default(128)),
    throat: z.preprocess(Number, z.number().min(0).max(255).default(128)),
});

export type SpeakSchema = typeof speakSchema;

const Uint32ToUint8Array = (uint32: number) => {
    const result = new Uint8Array(4);
    result[0] = uint32;
    result[1] = uint32 >> 8;
    result[2] = uint32 >> 16;
    result[3] = uint32 >> 24;

    return result;
};

const Uint16ToUint8Array = (uint16: number) => {
    const result = new Uint8Array(2);
    result[0] = uint16;
    result[1] = uint16 >> 8;

    return result;
};

const RenderBuffer = (audiobuffer: Uint8Array) => {
    const text2Uint8Array = (text: string) => {
        const buffer = new Uint8Array(text.length);
        text.split("").forEach((e, index) => {
            buffer[index] = e.charCodeAt(0);
        });
        return buffer;
    };

    // Calculate buffer size.
    const realbuffer = new Uint8Array(
        4 + // "RIFF"
            4 + // uint32 filesize
            4 + // "WAVE"
            4 + // "fmt "
            4 + // uint32 fmt length
            2 + // uint16 fmt
            2 + // uint16 channels
            4 + // uint32 sample rate
            4 + // uint32 bytes per second
            2 + // uint16 block align
            2 + // uint16 bits per sample
            4 + // "data"
            4 + // uint32 chunk length
            audiobuffer.length
    );

    let pos = 0;
    const write = (buffer: Uint8Array) => {
        realbuffer.set(buffer, pos);
        pos += buffer.length;
    };

    //RIFF header
    write(text2Uint8Array("RIFF")); // chunkID
    write(Uint32ToUint8Array(audiobuffer.length + 12 + 16 + 8 - 8)); // ChunkSize
    write(text2Uint8Array("WAVE")); // riffType
    //format chunk
    write(text2Uint8Array("fmt "));
    write(Uint32ToUint8Array(16)); // ChunkSize
    write(Uint16ToUint8Array(1)); // wFormatTag - 1 = PCM
    write(Uint16ToUint8Array(1)); // channels
    write(Uint32ToUint8Array(22050)); // samplerate
    write(Uint32ToUint8Array(22050)); // bytes/second
    write(Uint16ToUint8Array(1)); // blockalign
    write(Uint16ToUint8Array(8)); // bits per sample
    //data chunk
    write(text2Uint8Array("data"));
    write(Uint32ToUint8Array(audiobuffer.length)); // buffer length
    write(audiobuffer);

    return realbuffer;
};

export const GET: RequestHandler = async (req) => {
    const mouth = req.url.searchParams.get("mouth") ?? undefined;
    const throat = req.url.searchParams.get("throat") ?? undefined;
    const speed = req.url.searchParams.get("speed") ?? undefined;
    const pitch = req.url.searchParams.get("pitch") ?? undefined;
    const text = req.url.searchParams.get("text") ?? undefined;

    console.log();

    const opts = speakSchema.safeParse({
        text: text,
        pitch: pitch,
        speed: speed,
        mouth: mouth,
        throat: throat,
    });

    if (!opts.success) {
        return new Response(JSON.stringify(opts.error), {
            status: 400,
            headers: {
                "content-type": "application/json",
            },
        });
    }

    const options = opts.data;
    const sam = new SamJs({
        mouth: options.mouth,
        throat: options.throat,
        speed: options.speed,
        pitch: options.pitch,
    });

    // 8 bit wave buffer
    const result = sam.buf8(options.text).valueOf();
    if (typeof result === "boolean") {
        return new Response("Unknown Error", {
            status: 500,
        });
    }
    const rendered = RenderBuffer(result);
    return new Response(rendered, {
        headers: {
            "content-type": "audio/wav",
        },
    });
};
