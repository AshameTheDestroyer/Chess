import React, { useRef, useEffect } from "react";

import { ChildlessComponentProps } from "../../Types/ComponentProps";

import "./LazyImage.scss";

type LazyImageProps = {
    alternativeText: string;
    originalImageSource: string;
    pixelatedImageSource: string;
} & ChildlessComponentProps;

export default function LazyImage(props: LazyImageProps): React.ReactElement {
    const imageRef = useRef<HTMLImageElement>(null);
    const blurredImageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        imageRef.current?.addEventListener("load", OnImageLoad);

        return () => {
            imageRef.current?.removeEventListener("load", OnImageLoad);
        };
    }, []);

    function OnImageLoad(_e: Event): void {
        imageRef.current?.classList.remove("lazy-image-hidden");
        blurredImageRef.current?.classList.add("lazy-image-hidden");
    }

    return (
        <div
            id={props.id}
            className={[
                "lazy-image",
                props.className,
            ].toClassName()}
        >
            <img
                className="lazy-image-hidden"
                ref={imageRef}

                loading="lazy"
                alt={props.alternativeText}
                src={props.originalImageSource}
            />
            <img
                className="pixelated-lazy-image"
                ref={blurredImageRef}

                aria-hidden={true}
                src={props.pixelatedImageSource}
            />
        </div>
    );
}