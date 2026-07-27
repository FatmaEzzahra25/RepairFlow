package com.RepairFlow.security.config;

import com.RepairFlow.security.model.Utilisateur;
import com.RepairFlow.security.repository.UtilisateurRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;
    private final UtilisateurRepository utilisateurRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final Long userId;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("[JWT] Pas de header Authorization pour {} {}", request.getMethod(), request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);

        try {
            userId = jwtService.extractUserId(jwt);
            log.info("[JWT] Token recu pour {} {} -> userId extrait = {}", request.getMethod(), request.getRequestURI(), userId);

            if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                Utilisateur userDetails = utilisateurRepository.findById(userId).orElse(null);

                if (userDetails == null) {
                    log.warn("[JWT] Aucun utilisateur trouve pour l'id {}", userId);
                } else {
                    log.info("[JWT] Utilisateur trouve: id={}, email={}, role={}", userDetails.getId(), userDetails.getEmail(), userDetails.getRole());
                }

                if (userDetails != null && jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.info("[JWT] Authentification OK, authorities={}", userDetails.getAuthorities());
                } else if (userDetails != null) {
                    log.warn("[JWT] Token invalide (isTokenValid=false) pour l'utilisateur {}", userDetails.getEmail());
                }
            }
        } catch (Exception e) {
            log.error("[JWT] Exception pendant le traitement du token: {}", e.toString(), e);
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}