document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.querySelector('.upload-btn');
    const previewContainer = document.querySelector('.preview-container');
    const controlPanel = document.querySelector('.control-panel');
    const originalImage = document.getElementById('originalImage');
    const compressedImage = document.getElementById('compressedImage');
    const originalSize = document.getElementById('originalSize');
    const compressedSize = document.getElementById('compressedSize');
    const qualitySlider = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    const downloadBtn = document.getElementById('downloadBtn');

    // 上传按钮点击事件
    uploadBtn.addEventListener('click', () => fileInput.click());

    // 文件选择事件
    fileInput.addEventListener('change', handleFileSelect);

    // 拖拽事件
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // 质量滑块事件
    qualitySlider.addEventListener('input', (e) => {
        qualityValue.textContent = `${e.target.value}%`;
        compressImage();
    });

    // 处理文件选择
    function handleFileSelect(e) {
        const file = e.target.files[0];
        handleFile(file);
    }

    // 处理文件
    function handleFile(file) {
        if (!file.type.match('image.*')) {
            alert('请选择图片文件！');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            originalImage.src = e.target.result;
            originalSize.textContent = formatFileSize(file.size);
            previewContainer.style.display = 'grid';
            controlPanel.style.display = 'block';
            compressImage();
        };
        reader.readAsDataURL(file);
    }

    // 压缩图片
    function compressImage() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const quality = qualitySlider.value / 100;

        // 等待原始图片加载完成
        if (!originalImage.complete) {
            originalImage.onload = () => compressImage();
            return;
        }

        canvas.width = originalImage.naturalWidth;
        canvas.height = originalImage.naturalHeight;
        ctx.drawImage(originalImage, 0, 0);

        // 压缩图片
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            compressedImage.src = url;
            compressedSize.textContent = formatFileSize(blob.size);
            
            // 更新下载按钮
            downloadBtn.onclick = () => {
                try {
                    const link = document.createElement('a');
                    const timestamp = new Date().getTime();
                    const fileName = `compressed-image-${timestamp}.jpg`;
                    
                    link.href = compressedImage.src;  // 使用压缩后图片的 URL
                    link.download = fileName;
                    
                    // 添加提示信息
                    alert(`图片将被下载为: ${fileName}\n请在下载文件夹中查看`);
                    
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    // 打开下载文件夹
                    setTimeout(() => {
                        alert('下载完成！文件保存在"下载"文件夹中。\n按 Command(⌘) + Shift + D 可以快速打开下载文件夹。');
                    }, 1000);
                } catch (error) {
                    alert('下载出错：' + error.message);
                }
            };
        }, 'image/jpeg', quality);
    }

    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 获取文件扩展名
    function getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }
}); 