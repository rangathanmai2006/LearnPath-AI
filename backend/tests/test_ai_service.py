import os
from unittest.mock import patch, MagicMock
import requests
import pytest
from backend.app.config import is_gemini_configured, get_gemini_api_key, load_dotenv_file
from backend.app.services.ai_service import (
    generate_tutor_response,
    extract_code_snippet,
    extract_formula,
    PRIMARY_MODEL,
    FALLBACK_MODEL,
    PRIMARY_API_URL,
    FALLBACK_API_URL,
    GEMINI_API_URL
)

def test_extract_code_and_formula_helpers():
    """Test extracting code blocks and formulas from markdown responses."""
    sample_text = (
        "Here is the derivation for Mean Squared Error:\n"
        "$$MSE = \\frac{1}{n} \\sum_{i=1}^{n} (y_i - \\hat{y}_i)^2$$\n\n"
        "Here is the PyTorch implementation:\n"
        "```python\n"
        "loss = torch.mean((y_pred - y_true) ** 2)\n"
        "```\n"
        "How would you modify this for MAE?"
    )

    code = extract_code_snippet(sample_text)
    assert code == "loss = torch.mean((y_pred - y_true) ** 2)"

    formula = extract_formula(sample_text)
    assert "MSE" in formula and "\\sum" in formula

def test_ai_tutor_fallback_when_unconfigured():
    """Test AI Tutor returns helpful fallback when GEMINI_API_KEY is not configured."""
    with patch.dict(os.environ, {"GEMINI_API_KEY": ""}, clear=False):
        assert is_gemini_configured() is False
        res = generate_tutor_response("Explain gradient descent", "Calculus")
        assert res["is_live_ai"] is False
        assert "not configured" in res["message"]

def test_gemini_model_endpoints():
    """Verify that primary model is gemini-3-flash-preview and fallback is gemini-3.6-flash."""
    assert PRIMARY_MODEL == "gemini-3-flash-preview"
    assert FALLBACK_MODEL == "gemini-3.6-flash"
    assert "gemini-3-flash-preview" in PRIMARY_API_URL
    assert "gemini-3.6-flash" in FALLBACK_API_URL
    assert GEMINI_API_URL == PRIMARY_API_URL

def test_gemini_primary_model_success_mocked():
    """Test primary Gemini API call succeeds with x-goog-api-key header security."""
    fake_key = "AIzaSyTestMockKey1234567890"

    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {
                            "text": (
                                "Stochastic gradient descent updates weights per mini-batch.\n\n"
                                "$$\\theta = \\theta - \\eta \\nabla L$$\n\n"
                                "```python\noptimizer.step()\n```\n\n"
                                "Why do you think smaller batch sizes introduce regularization?"
                            )
                        }
                    ]
                }
            }
        ]
    }

    with patch.dict(os.environ, {"GEMINI_API_KEY": fake_key}, clear=False):
        with patch("backend.app.services.ai_service.requests.post", return_value=mock_response) as mock_post:
            res = generate_tutor_response(
                "How does SGD work?",
                "Deep Learning",
                [{"sender": "user", "message": "Explain a neural network update."}, {"sender": "ai", "message": "Weights move opposite the gradient."}],
            )

            assert res["is_live_ai"] is True
            assert res["model"] == PRIMARY_MODEL
            assert "Stochastic gradient descent" in res["message"]
            assert res["code_snippet"] == "optimizer.step()"
            assert "\\theta" in res["formula"]

            # Verify security: primary model was called once, no key in URL, header contains key
            mock_post.assert_called_once()
            called_url = mock_post.call_args[0][0]
            called_headers = mock_post.call_args[1]["headers"]

            assert "?key=" not in called_url
            assert called_url == PRIMARY_API_URL
            assert "x-goog-api-key" in called_headers
            assert called_headers["x-goog-api-key"] == fake_key
            prompt_text = mock_post.call_args[1]["json"]["contents"][0]["parts"][0]["text"]
            assert "Weights move opposite the gradient" in prompt_text
            assert "Student's current question: How does SGD work?" in prompt_text

def test_gemini_fallback_on_primary_503():
    """Test that when primary model returns HTTP 503, fallback model is invoked and succeeds."""
    fake_key = "AIzaSyTestMockKey1234567890"

    primary_503 = MagicMock()
    primary_503.status_code = 503
    primary_503.text = "The model is overloaded."

    fallback_200 = MagicMock()
    fallback_200.status_code = 200
    fallback_200.json.return_value = {
        "candidates": [
            {
                "content": {
                    "parts": [{"text": "Hello from fallback model! Here is your explanation."}]
                }
            }
        ]
    }

    with patch.dict(os.environ, {"GEMINI_API_KEY": fake_key}, clear=False):
        with patch("backend.app.services.ai_service.requests.post", side_effect=[primary_503, fallback_200]) as mock_post:
            res = generate_tutor_response("Explain recursion", "CS")

            assert res["is_live_ai"] is True
            assert res["model"] == FALLBACK_MODEL
            assert "Hello from fallback model!" in res["message"]
            assert mock_post.call_count == 2
            # First call was to PRIMARY_API_URL
            assert mock_post.call_args_list[0][0][0] == PRIMARY_API_URL
            # Second call was to FALLBACK_API_URL
            assert mock_post.call_args_list[1][0][0] == FALLBACK_API_URL

def test_gemini_fallback_on_primary_timeout():
    """Test that when primary model times out, fallback model is invoked and succeeds."""
    fake_key = "AIzaSyTestMockKey1234567890"

    fallback_200 = MagicMock()
    fallback_200.status_code = 200
    fallback_200.json.return_value = {
        "candidates": [
            {
                "content": {
                    "parts": [{"text": "Fallback answered after primary timeout."}]
                }
            }
        ]
    }

    with patch.dict(os.environ, {"GEMINI_API_KEY": fake_key}, clear=False):
        with patch("backend.app.services.ai_service.requests.post", side_effect=[requests.exceptions.Timeout("Read timeout"), fallback_200]) as mock_post:
            res = generate_tutor_response("Explain pointers", "C++")

            assert res["is_live_ai"] is True
            assert "Fallback answered after primary timeout" in res["message"]
            assert mock_post.call_count == 2


def test_fallback_http_error_is_reported_after_primary_timeout():
    fallback_503 = MagicMock()
    fallback_503.status_code = 503
    fallback_503.text = "The model is overloaded."
    with patch.dict(os.environ, {"GEMINI_API_KEY": "AIzaSyValidKeyTest12345678"}, clear=False):
        with patch("backend.app.services.ai_service.requests.post", side_effect=[requests.exceptions.Timeout("Read timeout"), fallback_503]) as mock_post:
            result = generate_tutor_response("Explain attention", "NLP")
    assert mock_post.call_count == 2
    assert "HTTP 503" in result["message"]

def test_gemini_both_models_fail_503():
    """Test graceful handling when both primary and fallback return 503."""
    primary_503 = MagicMock()
    primary_503.status_code = 503
    primary_503.text = "Overloaded"

    fallback_503 = MagicMock()
    fallback_503.status_code = 503
    fallback_503.text = "Overloaded"

    with patch.dict(os.environ, {"GEMINI_API_KEY": "AIzaSyValidKeyTest12345678"}, clear=False):
        with patch("backend.app.services.ai_service.requests.post", side_effect=[primary_503, fallback_503]):
            res = generate_tutor_response("Explain attention", "NLP")
            assert res["is_live_ai"] is False
            assert "HTTP 503" in res["message"]
            assert "temporarily unavailable" in res["message"].lower()

def test_gemini_invalid_key_403_handling():
    """Test graceful handling when an invalid or expired API key returns HTTP 403."""
    mock_response = MagicMock()
    mock_response.status_code = 403
    mock_response.text = '{"error": {"message": "API key not valid"}}'

    with patch.dict(os.environ, {"GEMINI_API_KEY": "AIzaSyInvalidKeyTest12345"}, clear=False):
        with patch("backend.app.services.ai_service.requests.post", return_value=mock_response) as mock_post:
            res = generate_tutor_response("Explain attention", "NLP")
            assert res["is_live_ai"] is False
            assert "HTTP 403" in res["message"]
            assert "invalid, unauthorized" in res["message"]
            # Should fail fast without calling fallback
            assert mock_post.call_count == 1

def test_gemini_rate_limit_429_both_models():
    """Test graceful handling when API rate limits return HTTP 429 across models."""
    mock_429 = MagicMock()
    mock_429.status_code = 429
    mock_429.text = '{"error": {"message": "Resource has been exhausted"}}'

    with patch.dict(os.environ, {"GEMINI_API_KEY": "AIzaSyValidKeyTest12345678"}, clear=False):
        with patch("backend.app.services.ai_service.requests.post", side_effect=[mock_429, mock_429]):
            res = generate_tutor_response("Explain softmax", "Deep Learning")
            assert res["is_live_ai"] is False
            assert "HTTP 429" in res["message"]
            assert "rate limit" in res["message"].lower()

def test_gemini_both_timeout_handling():
    """Test graceful handling when all models time out."""
    with patch.dict(os.environ, {"GEMINI_API_KEY": "AIzaSyValidKeyTest12345678"}, clear=False):
        with patch("backend.app.services.ai_service.requests.post", side_effect=requests.exceptions.Timeout("Read timeout")):
            res = generate_tutor_response("Explain backprop", "Calculus")
            assert res["is_live_ai"] is False
            assert "timed out" in res["message"].lower()

def test_gemini_connection_error_handling():
    """Test graceful handling when network connection fails."""
    with patch.dict(os.environ, {"GEMINI_API_KEY": "AIzaSyValidKeyTest12345678"}, clear=False):
        with patch("backend.app.services.ai_service.requests.post", side_effect=requests.exceptions.ConnectionError("Network down")):
            res = generate_tutor_response("Explain backprop", "Calculus")
            assert res["is_live_ai"] is False
            assert "network error" in res["message"].lower()
