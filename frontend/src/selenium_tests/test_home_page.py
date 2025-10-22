# tests/selenium/test_homepage.py
import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class TestHomePage(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        options = Options()
        options.add_argument("--headless")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")

        cls.driver = webdriver.Chrome(options=options)
        cls.wait = WebDriverWait(cls.driver, 10)  # waits up to 10 seconds for elements to appear
        cls.base_url = "https://foodbankconnect.me"  # ✅ change this to your deployed URL

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()

    def test_homepage_title_and_content(self):
        """Verify homepage loads and shows title text"""
        self.driver.get(self.base_url)
        h1 = self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
        self.assertIn("Food Bank Connect", h1.text)

    def test_navigation_links_exist(self):
        """Verify homepage has key nav links"""
        self.driver.get(self.base_url)
        link_texts = ["View Food Banks", "View Sponsors", "View Programs", "About the Site"]
        for text in link_texts:
            link = self.wait.until(EC.presence_of_element_located((By.LINK_TEXT, text)))
            self.assertTrue(link.is_displayed(), f"Missing link: {text}")

    def test_view_foodbanks_navigation(self):
        """Check that 'View Food Banks' link leads to correct route"""
        self.driver.get(self.base_url)
        link = self.wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "View Food Banks")))
        link.click()
        self.wait.until(EC.url_contains("/foodbanks"))
        self.assertIn("/foodbanks", self.driver.current_url)


if __name__ == "__main__":
    unittest.main()
