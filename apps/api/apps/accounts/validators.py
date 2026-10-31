import re

from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _


class ComplexPasswordValidator:
    """
    Validates that the password meets the Brightloop requirements:
    - Minimum 8 characters (handled also by MinimumLengthValidator)
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one special character
    """

    def validate(self, password, user=None):
        if not re.search(r"[A-Z]", password):
            raise ValidationError(
                _("This password must contain at least one uppercase letter."),
                code="password_no_upper",
            )
        if not re.search(r"[a-z]", password):
            raise ValidationError(
                _("This password must contain at least one lowercase letter."),
                code="password_no_lower",
            )
        if not re.search(r"[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]", password):
            raise ValidationError(
                _("This password must contain at least one special character."),
                code="password_no_symbol",
            )

    def get_help_text(self):
        return _(
            "Your password must contain at least 8 characters, including an uppercase letter, "
            "a lowercase letter, and a special character."
        )
