FROM owasp/modsecurity-crs:nginx
ENV MODSEC_RULE_ENGINE=On
ENV PARANOIA=2

COPY conf/custom-rules.conf /etc/modsecurity.d/owasp-crs/custom-rules.conf