package com.nt.sns.post.service;

import com.nt.sns.common.exception.BusinessException;
import com.nt.sns.common.exception.ErrorCode;
import com.nt.sns.post.domain.PostImage;
import com.nt.sns.post.mapper.PostMapper;
import com.nt.sns.storage.StorageService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class PostImageService {

    private static final String BUCKET = "sns-images";
    private static final int MAX_IMAGES = 4;
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp"
    );

    private final PostMapper postMapper;
    private final StorageService storageService;

    public PostImageService(PostMapper postMapper, StorageService storageService) {
        this.postMapper = postMapper;
        this.storageService = storageService;
    }

    public void uploadImages(Long postId, List<MultipartFile> images) {
        List<MultipartFile> valid = images.stream()
                .filter(f -> f != null && !f.isEmpty()).toList();
        if (valid.size() > MAX_IMAGES) {
            throw new BusinessException(ErrorCode.INVALID_INPUT);
        }
        for (int i = 0; i < valid.size(); i++) {
            MultipartFile file = valid.get(i);
            try {
                String contentType = file.getContentType();
                if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
                    throw new BusinessException(ErrorCode.INVALID_INPUT);
                }
                String ext = Optional.ofNullable(file.getOriginalFilename())
                        .filter(n -> n.contains("."))
                        .map(n -> n.substring(n.lastIndexOf('.')))
                        .orElse("");
                String objectName = postId + "/" + i + "_" + UUID.randomUUID() + ext;
                String url = storageService.upload(BUCKET, objectName,
                        file.getInputStream(), file.getSize(), contentType);
                PostImage img = new PostImage();
                img.setPostId(postId);
                img.setImageUrl(url);
                img.setDisplayOrder(i);
                postMapper.insertImage(img);
            } catch (BusinessException e) {
                throw e;
            } catch (Exception e) {
                throw new BusinessException(ErrorCode.FILE_UPLOAD_FAILED);
            }
        }
    }

    public void deleteImages(Long postId) {
        List<String> urls = postMapper.findImageUrls(postId);
        for (String url : urls) {
            String objectName = url.substring(url.indexOf(BUCKET) + BUCKET.length() + 1);
            try {
                storageService.delete(BUCKET, objectName);
            } catch (Exception ignored) {}
        }
        postMapper.deleteImagesByPostId(postId);
    }
}
