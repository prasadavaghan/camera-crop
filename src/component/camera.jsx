import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image, Rect, Transformer } from 'react-konva';

function Camera() {
    const [image, setImage] = useState(null);
    const [cropRect, setCropRect] = useState(null);
    const stageRef = useRef(null);
    const cropRectRef = useRef(null);
    const transformerRef = useRef(null);
    const [cropped,setCropped]=useState(false)
    const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

    //get screen dimension
    useEffect(() => {
        const handleResize = () => {
            const containerWidth = window.innerWidth * 0.8; // Adjust the percentage as needed
            const containerHeight = window.innerHeight * 0.8; // Adjust the percentage as needed
            setStageSize({ width: containerWidth, height: containerHeight });
        };

        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    //File upload fuction
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            const img = new window.Image();
            img.src = reader.result;
            img.onload = () => {
                setImage(img);
                setCropRect({
                    x: 10,
                    y: 10,
                    width: stageSize.width - 50,
                    height: stageSize.height - 50,
                });
            };
        };
        reader.readAsDataURL(file);
        if(cropped){
            setCropped(false)
            setCropRect({
                x: 10,
                y: 10,
                width: image.width - 50,
                height: image.heigoht - 50,
            });
        }
    };
    //Get the x, y for cropping box
    const handleRectChange = () => {
        const rect = cropRectRef.current;
        setCropRect({
            x: rect.x(),
            y: rect.y(),
            width: rect.width(),
            height: rect.height(),
        });
    };
    //For cropping image
    const handleCropImage = () => {
        const stage = stageRef.current;
        const croppedRect = cropRectRef.current;

        // Get the actual dimensions of the image
        const imageWidth = image.naturalWidth;
        const imageHeight = image.naturalHeight;

        // Get the scale factors for transforming the crop coordinates
        const scaleX = imageWidth / stage.width();
        const scaleY = imageHeight / stage.height();

        // Calculate the cropped region coordinates in the original image space
        const cropX = (croppedRect.x() - stage.x()) * scaleX;
        const cropY = (croppedRect.y() - stage.y()) * scaleY;
        const cropWidth = croppedRect.width() * scaleX;
        const cropHeight = croppedRect.height() * scaleY;

        // Create a canvas to hold the cropped image
        const canvas = document.createElement('canvas');
        canvas.width = cropWidth;
        canvas.height = cropHeight;
        const context = canvas.getContext('2d');

        // Draw the cropped region from the original image onto the canvas
        context.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

        // Convert the canvas data to a data URL
        const dataURL = canvas.toDataURL();

        // Create a new image object with the cropped image
        const croppedImage = new window.Image();
        croppedImage.src = dataURL;
        croppedImage.onload = () => {
            // Update the image state with the cropped image
            setImage(croppedImage);

            // Calculate the position and dimensions to fit the cropped image within the stage
            const fitWidth = Math.min(stage.width(), croppedImage.width);
            const fitHeight = Math.min(stage.height(), croppedImage.height);
            const fitX = (stage.width() - fitWidth) / 2;
            const fitY = (stage.height() - fitHeight) / 2;

            // Update the cropRect coordinates to fit the cropped image
            setCropRect({
                x: fitX,
                y: fitY,
                width: fitWidth,
                height: fitHeight,
            });
        };
    };



    return (
        <div>
            <input type="file" onChange={handleImageUpload} />
            {image && (
                <React.Fragment>
                    <Stage width={stageSize.width} height={stageSize.height} ref={stageRef}>
                        <Layer>
                            <Image image={image} width={stageSize.width} height={stageSize.height} />
                            {cropRect && (
                                <React.Fragment>
                                    <Rect
                                        ref={cropRectRef}
                                        x={cropRect.x}
                                        y={cropRect.y}
                                        width={cropRect.width}
                                        height={cropRect.height}
                                        draggable
                                        onDragEnd={handleRectChange}
                                        onTransformEnd={handleRectChange}
                                        stroke="red" // Set the desired color here
                                        strokeWidth={1}
                                    />
                                    {cropRectRef.current && (
                                        <Transformer
                                            ref={transformerRef}
                                            nodes={[cropRectRef.current]}
                                        />
                                    )}
                                </React.Fragment>
                            )}
                        </Layer>
                    </Stage>
                    <button onClick={handleCropImage}>Crop Image</button>
                    <p>Move the red box to resize the image , and once clicked on the crop button wait for 3 sec.</p>
                </React.Fragment>
            )}
        </div>
    );
}

export default Camera;
