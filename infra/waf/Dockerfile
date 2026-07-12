FROM owasp/modsecurity-crs:nginx
ENV MODSEC_RULE_ENGINE=On
ENV PARANOIA=2

COPY conf/custom-rules.conf /etc/modsecurity.d/owasp-crs/rules/custom-rules.conf
COPY conf/socket-exclusions.conf /etc/modsecurity.d/owasp-crs/rules/REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf
COPY conf/redirect.conf /etc/nginx/conf.d/redirect.conf
