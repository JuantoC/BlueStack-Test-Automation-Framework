const { By, Builder, until } = require('selenium-webdriver');
const assert = require("assert")
const chrome = require('selenium-webdriver/chrome');

(async function basicAuth() {
  const options = new chrome.Options();
  options.addArguments(
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-default-apps',
    '--incognito',
    '--start-maximized',
    '--force-device-scale-factor=0.8'
  );
  options.setUserPreferences({
    'credentials_enable_service': false,
    'profile.password_manager_enabled': false
  });

  let driver;

  try {
    // Encode credentials Basic Auth
    const authUsername = 'redaccion';
    const authPassword = '9.R3daxc10!n';
    const authUrl = `https://${authUsername}:${encodeURIComponent(authPassword)}@testing.d39hyz3zgpw7gd.amplifyapp.com/admin/post/16`;
    console.log(authUrl)
    // User Loging
    const logUsername = 'jtcaldera';
    const logPassword = 'uw%4sm1UIzIxT0';

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    await driver.get(authUrl);
    console.log("Login page loaded - ok");
    // Input Boxes
    let username_input = await driver.findElement(By.id('username-field-log'))
    let password_input = await driver.findElement(By.id('password-field-log'))

    await driver.wait(until.elementIsVisible(username_input), 3000)

    await driver.executeScript("arguments[0].focus();", username_input);
    await username_input.sendKeys(logUsername);

    await driver.executeScript("arguments[0].focus();", password_input);
    await password_input.sendKeys(logPassword);
    console.log('Login inputs - ok')

    const login_button = await driver.findElement(By.css('.security-card-submit-button'));
    await login_button.click();
    console.log('Finish login - ok')
    // I Will Do It Later BUTTON
    let do_it_later_btn = await driver.wait(
      until.elementLocated(By.css('[data-testid="btn-next"]')),
      3000
    );
    await driver.wait(
      until.elementIsVisible(do_it_later_btn),
      3000
    );
    await driver.wait(
      until.elementIsEnabled(do_it_later_btn),
      3000
    );
    await driver.sleep(200);
    await do_it_later_btn.click();
    console.log('Will do it later btn - ok')

    // Create New Post
    let create_post_btn = await driver.wait(
      until.elementLocated(
        By.css("button.btn-create-note")
      ),
      6000
    );
    await driver.wait(until.elementIsVisible(create_post_btn), 2000)
    await driver.wait(until.elementIsEnabled(create_post_btn), 2000)
    await create_post_btn.click();
    console.log('Btn Create Post - ok')

      let new_post = await driver.wait(
        until.elementLocated(By.css('#option-dropdown-0 label')),
        3000
      );
      await driver.wait(
        until.elementIsVisible(new_post),
        3000
      );
      await new_post.click();

    console.log('New Post - ok')

    // Titulo
    let main_title = await driver.wait(until.elementLocated(By.css('.main__title-height')), 10000);
    await driver.wait(until.elementIsVisible(main_title), 2000)
    await driver.wait(until.elementIsEnabled(main_title), 2000)
    await main_title.click();
    console.log('Input Titulo - ok')

    const msg_titulo = 'Nueva Nota de Prueba Automatizada por JT';
    await main_title.sendKeys(msg_titulo)
    assert.equal(await main_title.getAttribute('value'), msg_titulo);
    console.log('Titulo ejemplo - ok')


    await driver.sleep(30000)
  } catch (err) {
    console.error(err);
  } finally {
    await driver.quit();
  }
})();
