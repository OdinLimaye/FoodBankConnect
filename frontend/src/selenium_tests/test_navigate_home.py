# test_navigate_about_home.py
import unittest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TestHomeToAbout(unittest.TestCase):
    BASE_URL = "https://foodbankconnect.me"  # live site

    def setUp(self):
        chrome_options = Options()
        chrome_options.add_argument("--headless")  # fast, no GUI
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        self.driver = webdriver.Chrome(options=chrome_options)
        self.wait = WebDriverWait(self.driver, 5)

    def tearDown(self):
        self.driver.quit()

    def test_home_to_about_and_back(self):
        driver = self.driver
        wait = self.wait

        # Step 1: Go to Home page
        driver.get(self.BASE_URL)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "h1")))

        # Step 2: Click "About the Site" button
        about_btn = wait.until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "a[href='/about']"))
        )
        about_btn.click()

        # Step 3: Wait for About page to load
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
        self.assertIn("About the Site", driver.find_element(By.TAG_NAME, "h1").text)

        # Step 4: Click Navbar home link (logo)
        home_link = wait.until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "nav a.navbar-brand"))
        )
        home_link.click()

        # Step 5: Wait for Home page to load again
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "h1")))
        self.assertIn("Food Bank Connect", driver.find_element(By.CSS_SELECTOR, "h1").text)

        print("✅ Home → About → Home navigation test passed.")

if __name__ == "__main__":
    unittest.main(verbosity=2)
