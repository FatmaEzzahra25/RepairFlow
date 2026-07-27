package com.RepairFlow.security.config;

import com.RepairFlow.security.model.Utilisateur;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class JwtService {
    private static final String SECRET_KEY ="b4c2791c46745b6fb3791e021f0cb7ee450f826f58ddcede470421dedcbba56a";

    public Long extractUserId(String token) {
        String subject = extractClaims(token, Claims::getSubject);
        return subject != null ? Long.valueOf(subject) : null;
    }

    public String extractRole(String token) {
        return extractClaims(token, claims -> claims.get("role", String.class));
    }

    public <T> T extractClaims(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(
            Map<String, Object> extraClaims,
            UserDetails userDetails
    ) {
        String role = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));
        extraClaims.put("role", role);

        // Le subject devient l'ID (chiffre/signe dans le token), plus l'email.
        String subject = (userDetails instanceof Utilisateur utilisateur)
                ? String.valueOf(utilisateur.getId())
                : userDetails.getUsername();

        return Jwts
                .builder()
                .claims(extraClaims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 24))
                .signWith(getSignIntKey())
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final Long userId = extractUserId(token);
        boolean sameUser = (userDetails instanceof Utilisateur utilisateur)
                && userId != null
                && userId.equals(utilisateur.getId());
        return sameUser && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaims(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts
                .parser()
                .verifyWith(getSignIntKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public SecretKey getSignIntKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}