"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button, Upload, Image, Progress } from "antd";
import { UploadOutlined, RedoOutlined, CopyOutlined } from "@ant-design/icons";
import { createWorker } from "tesseract.js";

import styles from "./page.module.scss";

const Home = () => {
  const [sourceImg, setSourceImg] = useState("");
  const [progress, setProgress] = useState(0);
  const [ocr, setOcr] = useState("");
  const [convertLoading, setConvertLoading] = useState(false);

  useEffect(() => {
    document.title = "nextjs-tesseract";
  }, []);

  const worker = useMemo(async () => {
    return await createWorker("chi_sim", 1, {
      logger: (m) => {
        console.log(m);
        setProgress(m.progress);
      },
    });
  }, []);

  const handleOCR = async () => {
    setConvertLoading(true);
    try {
      const {
        data: { text },
      } = await (await worker).recognize(sourceImg);
      setOcr(text);
    } finally {
      setConvertLoading(false);
    }
  };

  const handleImage = (info: any) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setSourceImg(reader.result as string);
    });
    reader.readAsDataURL(info.file.originFileObj);
  };

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(ocr);
    }
  };

  const percent = useMemo(() => {
    return Number(progress * 100).toFixed(2);
  }, [progress]);

  return (
    <div className={styles.container}>
      <div className={styles.btnGroup}>
        <Upload showUploadList={false} onChange={handleImage} maxCount={1}>
          <Button icon={<UploadOutlined />}>Select Image</Button>
        </Upload>
        <Button
          icon={<RedoOutlined />}
          loading={convertLoading}
          disabled={!sourceImg}
          onClick={handleOCR}
        >
          Convert
        </Button>
      </div>
      {sourceImg ? (
        <Image src={sourceImg} className={styles.img} alt="" />
      ) : (
        <div className={styles.tips}>Please Select an Image</div>
      )}
      {convertLoading ? (
        <Progress
          percent={percent}
          status="active"
          strokeColor={{ from: "#108ee9", to: "#87d068" }}
        />
      ) : ocr ? (
        <div>
          <div className={styles.title}>
            Output
            <Button icon={<CopyOutlined />} onClick={handleCopy}>
              Copy
            </Button>
          </div>
          <div className={styles.result}>{ocr}</div>
        </div>
      ) : null}
    </div>
  );
};

export default Home;
