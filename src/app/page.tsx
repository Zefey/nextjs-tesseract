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
      // 本地安装
      //  https://github.com/naptha/tesseract.js/blob/master/docs/local-installation.md
      workerPath:
        "https://cdn.jsdelivr.net/npm/tesseract.js@v5.0.0/dist/worker.min.js",
      langPath: "https://tessdata.projectnaptha.com/4.0.0",
      corePath: "https://cdn.jsdelivr.net/npm/tesseract.js-core@v5.0.0",
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

  const handleImage = (file: File) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setSourceImg(reader.result as string);
    });
    reader.readAsDataURL(file);
    return false;
  };

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(ocr);
    }
  };

  const percent = useMemo(() => {
    return Number(Number(progress * 100).toFixed(2));
  }, [progress]);

  return (
    <div className={styles.container}>
      <div className={styles.btnGroup}>
        <Upload beforeUpload={handleImage} showUploadList={false} maxCount={1}>
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
