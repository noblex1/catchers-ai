"""
Feature Extractor for URL and Content Analysis
Extracts meaningful features for ML models
"""
import re
import math
from typing import Dict, List, Optional
from urllib.parse import urlparse
import tldextract
import validators


class FeatureExtractor:
    """Extract features from URLs and content for ML analysis"""
    
    def __init__(self):
        self.suspicious_tlds = {
            'tk', 'ml', 'ga', 'cf', 'gq', 'top', 'xyz', 'info', 'biz', 
            'work', 'click', 'link', 'loan', 'download', 'racing'
        }
        
        self.url_shorteners = {
            'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 
            'short.link', 'is.gd', 'buff.ly', 'adf.ly'
        }
        
        self.phishing_keywords = [
            'verify', 'account', 'suspended', 'urgent', 'security',
            'update', 'confirm', 'login', 'password', 'banking',
            'paypal', 'amazon', 'microsoft', 'apple', 'google'
        ]
    
    def extract_url_features(self, url: str, whois_data: Optional[Dict] = None, redirect_data: Optional[Dict] = None) -> Dict:
        """Extract features from URL"""
        try:
            # Parse URL
            parsed = urlparse(url)
            extracted = tldextract.extract(url)
            
            # Basic features
            url_length = len(url)
            domain = extracted.domain + '.' + extracted.suffix
            domain_length = len(domain)
            
            # Check for IP address
            has_ip = bool(re.match(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', parsed.netloc))
            
            # Special characters
            has_at = '@' in url
            has_double_slash = url.count('//') > 1
            num_dots = url.count('.')
            num_hyphens = url.count('-')
            num_underscores = url.count('_')
            num_digits = sum(c.isdigit() for c in url)
            num_special_chars = sum(not c.isalnum() for c in url)
            
            # Subdomain analysis
            subdomain = extracted.subdomain
            num_subdomains = len(subdomain.split('.')) if subdomain else 0
            
            # Entropy calculation (randomness measure)
            entropy = self._calculate_entropy(url)
            
            # TLD check
            suspicious_tld = extracted.suffix.lower() in self.suspicious_tlds
            
            # URL shortener check
            url_shortener = any(short in url.lower() for short in self.url_shorteners)
            
            # Path analysis
            path_length = len(parsed.path)
            num_path_segments = len([p for p in parsed.path.split('/') if p])
            
            # Query parameters
            has_query = bool(parsed.query)
            num_query_params = len(parsed.query.split('&')) if parsed.query else 0
            
            # Protocol
            is_https = parsed.scheme == 'https'

            # WHOIS-derived features
            domain_age_days = None
            recently_registered = False
            recently_updated = False
            days_to_expiry = None
            registrar = None

            if whois_data:
                try:
                    domain_age_days = whois_data.get('domainAgeDays')
                    recently_registered = bool(whois_data.get('recentlyRegistered'))
                    recently_updated = bool(whois_data.get('recentlyUpdated'))
                    registrar = whois_data.get('registrar')
                    if whois_data.get('expirationDate'):
                        from datetime import datetime
                        try:
                            exp = datetime.fromisoformat(whois_data.get('expirationDate'))
                            days_to_expiry = (exp - datetime.utcnow()).days
                        except Exception:
                            days_to_expiry = None
                except Exception:
                    pass

            # Redirect-derived features
            redirect_hops = None
            final_domain = None
            initial_final_domain_diff = False
            used_shortener = False

            if redirect_data:
                try:
                    redirect_hops = int(redirect_data.get('hops', 0))
                    final_domain = redirect_data.get('finalDomain')
                    initial_final_domain_diff = bool(redirect_data.get('domainChanged'))
                    used_shortener = bool(redirect_data.get('usedShortener'))
                except Exception:
                    pass
            
            return {
                'url_length': url_length,
                'domain_length': domain_length,
                'has_ip_address': has_ip,
                'has_at_symbol': has_at,
                'has_double_slash': has_double_slash,
                'num_subdomains': num_subdomains,
                'num_dots': num_dots,
                'num_hyphens': num_hyphens,
                'num_underscores': num_underscores,
                'num_digits': num_digits,
                'num_special_chars': num_special_chars,
                'entropy': entropy,
                'suspicious_tld': suspicious_tld,
                'url_shortener': url_shortener,
                'path_length': path_length,
                'num_path_segments': num_path_segments,
                'has_query': has_query,
                'num_query_params': num_query_params,
                'is_https': is_https,
                # WHOIS features
                'domain_age_days': domain_age_days,
                'recently_registered': recently_registered,
                'recently_updated': recently_updated,
                'days_to_expiry': days_to_expiry,
                'registrar_present': bool(registrar),
                # Redirect features
                'redirect_hops': redirect_hops,
                'final_domain': final_domain,
                'initial_final_domain_diff': initial_final_domain_diff,
                'used_shortener': used_shortener,
            }
            
        except Exception as e:
            print(f"Error extracting URL features: {e}")
            return self._get_default_features()
    
    def extract_content_features(self, content: str, url: Optional[str] = None) -> Dict:
        """Extract features from HTML/text content"""
        try:
            # Basic content features
            content_length = len(content)
            
            # HTML tag analysis
            num_scripts = len(re.findall(r'<script', content, re.IGNORECASE))
            num_iframes = len(re.findall(r'<iframe', content, re.IGNORECASE))
            num_forms = len(re.findall(r'<form', content, re.IGNORECASE))
            num_links = len(re.findall(r'<a\s+href', content, re.IGNORECASE))
            num_images = len(re.findall(r'<img', content, re.IGNORECASE))
            
            # Suspicious patterns
            has_hidden_elements = bool(re.search(r'display:\s*none|visibility:\s*hidden', content, re.IGNORECASE))
            has_obfuscated_js = bool(re.search(r'eval\(|unescape\(|fromCharCode', content, re.IGNORECASE))
            
            # Phishing keywords
            num_phishing_keywords = sum(
                content.lower().count(keyword) for keyword in self.phishing_keywords
            )
            
            # Form analysis
            has_password_field = bool(re.search(r'type=["\']password["\']', content, re.IGNORECASE))
            has_insecure_form = bool(re.search(r'<form[^>]*action=["\']http:', content, re.IGNORECASE))
            
            # External resources
            num_external_resources = len(re.findall(r'src=["\']https?://', content, re.IGNORECASE))
            
            # Combine with URL features if URL provided
            url_features = self.extract_url_features(url) if url else {}
            
            content_features = {
                'content_length': content_length,
                'num_scripts': num_scripts,
                'num_iframes': num_iframes,
                'num_forms': num_forms,
                'num_links': num_links,
                'num_images': num_images,
                'has_hidden_elements': has_hidden_elements,
                'has_obfuscated_js': has_obfuscated_js,
                'num_phishing_keywords': num_phishing_keywords,
                'has_password_field': has_password_field,
                'has_insecure_form': has_insecure_form,
                'num_external_resources': num_external_resources,
            }
            
            return {**url_features, **content_features}
            
        except Exception as e:
            print(f"Error extracting content features: {e}")
            return self._get_default_features()
    
    def identify_risk_factors(self, features: Dict, url: str) -> List[str]:
        """Identify specific risk factors based on features"""
        risk_factors = []
        
        if features.get('url_length', 0) > 75:
            risk_factors.append("Unusually long URL (potential obfuscation)")
        
        if features.get('has_ip_address'):
            risk_factors.append("Uses IP address instead of domain name")
        
        if features.get('has_at_symbol'):
            risk_factors.append("Contains @ symbol (URL manipulation technique)")
        
        if features.get('suspicious_tld'):
            risk_factors.append("Uses suspicious top-level domain")
        
        if features.get('url_shortener'):
            risk_factors.append("Uses URL shortening service (hides destination)")
        
        if features.get('entropy', 0) > 4.5:
            risk_factors.append("High entropy (random-looking URL)")
        
        if features.get('num_subdomains', 0) > 3:
            risk_factors.append("Excessive subdomains (potential spoofing)")
        
        if not features.get('is_https'):
            risk_factors.append("No HTTPS encryption")
        
        if features.get('num_hyphens', 0) > 3:
            risk_factors.append("Excessive hyphens in domain")
        
        if features.get('has_double_slash'):
            risk_factors.append("Multiple // in URL (potential redirect)")
        
        return risk_factors
    
    def identify_content_risk_factors(self, content: str, features: Dict) -> List[str]:
        """Identify risk factors in content"""
        risk_factors = []
        
        if features.get('num_iframes', 0) > 0:
            risk_factors.append(f"Contains {features['num_iframes']} iframe(s) (potential malware injection)")
        
        if features.get('has_obfuscated_js'):
            risk_factors.append("Contains obfuscated JavaScript code")
        
        if features.get('has_hidden_elements'):
            risk_factors.append("Contains hidden HTML elements")
        
        if features.get('has_insecure_form'):
            risk_factors.append("Form submits to insecure HTTP endpoint")
        
        if features.get('num_phishing_keywords', 0) > 3:
            risk_factors.append("Multiple phishing-related keywords detected")
        
        if features.get('num_scripts', 0) > 10:
            risk_factors.append("Excessive number of scripts")
        
        return risk_factors
    
    def identify_confidence_factors(self, features: Dict, prediction: Dict) -> List[str]:
        """Identify factors that increase confidence in prediction"""
        factors = []
        
        confidence = prediction.get('confidence', 0)
        
        if confidence > 0.9:
            factors.append("Very high model confidence (>90%)")
        elif confidence > 0.75:
            factors.append("High model confidence (>75%)")
        
        if features.get('is_https'):
            factors.append("Uses HTTPS encryption")
        
        if features.get('url_length', 0) < 50:
            factors.append("Normal URL length")
        
        if features.get('entropy', 0) < 3.5:
            factors.append("Low entropy (structured URL)")
        
        return factors
    
    def _calculate_entropy(self, text: str) -> float:
        """Calculate Shannon entropy of text"""
        if not text:
            return 0.0
        
        # Count character frequencies
        freq = {}
        for char in text:
            freq[char] = freq.get(char, 0) + 1
        
        # Calculate entropy
        entropy = 0.0
        text_len = len(text)
        for count in freq.values():
            probability = count / text_len
            entropy -= probability * math.log2(probability)
        
        return round(entropy, 2)
    
    def _get_default_features(self) -> Dict:
        """Return default features in case of error"""
        return {
            'url_length': 0,
            'domain_length': 0,
            'has_ip_address': False,
            'has_at_symbol': False,
            'has_double_slash': False,
            'num_subdomains': 0,
            'num_dots': 0,
            'num_hyphens': 0,
            'num_underscores': 0,
            'num_digits': 0,
            'num_special_chars': 0,
            'entropy': 0.0,
            'suspicious_tld': False,
            'url_shortener': False,
        }
