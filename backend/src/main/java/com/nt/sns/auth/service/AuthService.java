package com.nt.sns.auth.service;

import com.nt.sns.auth.dto.LoginRequest;
import com.nt.sns.auth.dto.LoginResponse;
import com.nt.sns.auth.dto.SignupRequest;
import com.nt.sns.auth.jwt.JwtProvider;
import com.nt.sns.common.exception.BusinessException;
import com.nt.sns.common.exception.ErrorCode;
import com.nt.sns.user.domain.User;
import com.nt.sns.user.mapper.UserMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
public class AuthService {

    private static final int MAX_FAIL_COUNT = 5;
    private static final int LOCK_MINUTES = 10;

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    public AuthService(UserMapper userMapper,
                       PasswordEncoder passwordEncoder,
                       JwtProvider jwtProvider) {
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtProvider = jwtProvider;
    }

    @Transactional
    public void signup(SignupRequest req) {
        if (userMapper.existsByEmail(req.email())) {
            throw new BusinessException(ErrorCode.DUPLICATE_EMAIL);
        }
        if (userMapper.existsByEmployeeNo(req.employeeNo())) {
            throw new BusinessException(ErrorCode.DUPLICATE_EMPLOYEE_NO);
        }

        User user = new User();
        user.setEmployeeNo(req.employeeNo());
        user.setEmail(req.email());
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setName(req.name());
        user.setDepartment(req.department());
        user.setPosition(req.position());
        userMapper.insert(user);
    }

    @Transactional
    public LoginResponse login(LoginRequest req) {
        User user = userMapper.findByEmail(req.email())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));

        if (user.isLocked()) {
            throw new BusinessException(ErrorCode.ACCOUNT_LOCKED);
        }

        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            int failCount = user.getLoginFailCount() + 1;
            OffsetDateTime lockUntil = failCount >= MAX_FAIL_COUNT
                    ? OffsetDateTime.now().plusMinutes(LOCK_MINUTES)
                    : null;
            userMapper.updateLoginFailCount(user.getId(), failCount, lockUntil);
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }

        userMapper.resetLoginFailCount(user.getId());

        String accessToken  = jwtProvider.generateAccessToken(user.getId(), user.getRole());
        String refreshToken = jwtProvider.generateRefreshToken(user.getId());
        return new LoginResponse(accessToken, refreshToken);
    }
}
